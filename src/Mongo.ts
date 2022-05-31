import { MongoClient, WithId, Document } from 'mongodb';
import { IMongo } from './interfaces';

export const MONGO_URI = 'mongodb://root:example@localhost:27017/?authMechanism=DEFAULT';
export const DB_NAME = 'great-equalizer';
export const TRANSACTIONS_COLLECTION = 'transactions';

class Mongo implements IMongo {
  client: MongoClient;

  constructor() {
    this.client = new MongoClient(MONGO_URI);
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
    const tranasactionDocument = { date, name, value };
    try {
      const result = await collection.insertOne(tranasactionDocument);
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
      const result = await cursor.toArray();
      return result;
    } catch (error) {
      console.error(error);
    }
    return null;
  }
}

export default Mongo;
