import colors from 'colors';
import csvParser from 'csv-parser';
import { formatDistanceToNowStrict } from 'date-fns';
import { config as dotenv } from 'dotenv';
import fs from 'fs';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import VectorDB from '../services/vector-db';

dotenv();

type Args = {
  csv?: string;
  field?: string;
};

const { csv, field } = yargs(hideBin(process.argv)).argv as Args;

if (!csv) {
  console.log(colors.red('Please provide a csv with the --csv flag'));
  process.exit(1);
}

if (!field) {
  console.log(colors.red('Please provide a field with the --field flag'));
  process.exit(1);
}

if (!fs.existsSync(csv)) {
  console.log(colors.red(`File ${csv} does not exist`));
  process.exit(1);
}

console.log(colors.yellow(`CSV: ${colors.underline(csv)}`));

(async () => {
  const start = new Date();
  const vectorDb = new VectorDB('./data/db');
  await vectorDb.init();

  const promises: Promise<boolean>[] = [];
  await new Promise(resolve => {
    fs.createReadStream(csv)
      .pipe(csvParser())
      .on('data', async row => {
        if (row[field]?.length < 8191) {
          promises.push(vectorDb.addItem(row[field]));
          return;
        }

        const chunks = row[field].match(/.{1,8191}/g) as string[];
        for (const chunk of chunks) {
          promises.push(vectorDb.addItem(chunk));
        }
      })
      .on('end', () => resolve(true));
  });

  let i = 1;
  for (const promise of promises) {
    console.log(
      `[${Math.ceil((i / promises.length) * 100)}%] Indexing chunk ${i++} of ${
        promises.length
      }...`,
    );
    await promise;
  }

  console.log(
    colors.green(`Indexed data in ${formatDistanceToNowStrict(start)}`),
  );
})();
