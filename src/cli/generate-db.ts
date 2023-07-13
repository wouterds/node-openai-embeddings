import colors from 'colors';
import { config as dotenv } from 'dotenv';
import fs from 'fs';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

dotenv();

type Args = {
  csv?: string;
};

const { csv } = yargs(hideBin(process.argv)).argv as Args;

if (!csv) {
  console.log(colors.red('Please provide a csv with the --csv flag'));
  process.exit(1);
}

if (!fs.existsSync(csv)) {
  console.log(colors.red(`File ${csv} does not exist`));
  process.exit(1);
}
