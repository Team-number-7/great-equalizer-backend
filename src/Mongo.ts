import { MongoClient, WithId, Document } from 'mongodb';
import { IMongo } from './interfaces';

const DB_HOST = process.env.DB_HOST || 'localhost';
export const MONGO_URI = `mongodb://root:example@${DB_HOST}:27017/?authMechanism=DEFAULT`;
export const DB_NAME = 'great-equalizer';
export const TRANSACTIONS_COLLECTION = 'transactions';

class Mongo implements IMongo {
  client: MongoClient;

  public static instance: Mongo;

  private constructor() {
    this.client = new MongoClient(MONGO_URI);
  }

  public static getInstance(): IMongo {
    if (!Mongo.instance) {
      Mongo.instance = new Mongo();
    }
    return Mongo.instance;
  }

  async connect() {
    try {
      await this.client.connect();
      await this.client.db('admin').command({ ping: 1 });
      console.log('Connected successfully to server');
    } catch (error) {
      console.error(error);
      await this.client.close();
    }
  }

  async seed() {
    const database = this.client.db(DB_NAME);
    try {
      await database.createCollection(TRANSACTIONS_COLLECTION);
    } catch (error) {
      console.error(error);
    } finally {
      console.log('db created');
    }
  }

  async createTransaction(date: Date, name: string, value: number): Promise<string | null> {
    const collection = this.client.db(DB_NAME).collection(TRANSACTIONS_COLLECTION);
    const transactionDocument = { date, name, value };
    try {
      const result = await collection.insertOne(transactionDocument);
      return result.insertedId.toString();
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  async getTransactions(): Promise<Array<WithId<Document>> | null> {
    const cursor = this.client
      .db(DB_NAME)
      .collection(TRANSACTIONS_COLLECTION)
      .find();
    try {
      return await cursor.toArray();
    } catch (error) {
      console.error(error);
    }
    return null;
  }
}

export default Mongo;
