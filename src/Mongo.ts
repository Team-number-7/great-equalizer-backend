import { MongoClient } from 'mongodb';

export const MONGO_URI = 'mongodb://root:example@localhost:27017/?authMechanism=DEFAULT';

export default class Mongo {
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
}
