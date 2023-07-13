import colors from 'colors';
import { config as dotenv } from 'dotenv';
import fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import { LocalIndex } from 'vectra';
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

(async () => {
  const index = new LocalIndex('./data/index');

  if (!(await index.isIndexCreated())) {
    console.log('Creating new index');
    await index.createIndex();
  } else {
    console.log('Re-using existing index');
  }

  const openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    }),
  );

  const getVector = async (text: string) => {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data.data[0].embedding;
  };

  const addItem = async (text: string) => {
    try {
      await index.insertItem({
        vector: await getVector(text),
        metadata: { text },
      });

      return true;
    } catch {
      return false;
    }
  };
})();
