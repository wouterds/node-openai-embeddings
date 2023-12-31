import colors from 'colors';
import { Configuration, OpenAIApi } from 'openai';
import { LocalIndex, MetadataTypes, QueryResult } from 'vectra';

class VectorDB {
  private _path: string;
  private _index: LocalIndex;
  private _openai: OpenAIApi | null = null;

  constructor(path: string) {
    this._path = path;
    this._index = new LocalIndex(path);
  }

  public async init() {
    const exists = await this._index.isIndexCreated();
    if (exists) {
      console.log(
        colors.yellow(
          `Re-using existing index: ${colors.underline(this._path)}`,
        ),
      );
      return;
    }

    console.log(
      colors.yellow(`Creating new index: ${colors.underline(this._path)}`),
    );
    await this._index.createIndex();
  }

  private get openai() {
    if (!this._openai) {
      console.log('Initializing OpenAI API');

      this._openai = new OpenAIApi(
        new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        }),
      );
    }

    return this._openai;
  }

  public async getVector(text: string) {
    try {
      const response = await this.openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data.data[0].embedding;
    } catch {
      return null;
    }
  }

  public async addItem(text: string) {
    const vector = await this.getVector(text);
    if (!vector) {
      return false;
    }

    try {
      await this._index.insertItem({ vector, metadata: { text } });
      return true;
    } catch {
      return false;
    }
  }

  public async getEmbeddings(text: string, limit = 2) {
    const vector = await this.getVector(text);
    if (!vector) {
      return null;
    }

    return await this._index.queryItems(vector, limit);
  }

  public async query(
    text: string,
    embeddings: QueryResult<Record<string, MetadataTypes>>[],
  ) {
    const response = await this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Context:${embeddings
        .map(embedding => embedding.item?.metadata?.text)
        .join(' ')
        .substring(0, 3800)}\n\nQ: ${text}\n\nA: `,
      max_tokens: 150,
      stop: ['A: '],
      temperature: 0.3,
    });

    return response.data.choices[0].text;
  }
}

export default VectorDB;
