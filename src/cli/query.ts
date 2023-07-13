import colors from 'colors';
import { config as dotenv } from 'dotenv';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

import VectorDB from '../services/vector-db';

dotenv();

type Args = {
  prompt?: string;
};

const { prompt } = yargs(hideBin(process.argv)).argv as Args;
if (!prompt) {
  console.log(colors.red('Please provide a prompt with the --prompt flag'));
  process.exit(1);
}

(async () => {
  const vectorDb = new VectorDB('./data/db');
  await vectorDb.init();

  console.log(colors.cyan(`Q: ${prompt}`));

  const embeddings = await vectorDb.getEmbeddings(prompt);
  if (!embeddings) {
    console.log(colors.red('Something went wrong'));
    process.exit(1);
  }

  const reply = await vectorDb.query(prompt, embeddings);

  console.log(colors.green(`A:${reply}`));
})();
