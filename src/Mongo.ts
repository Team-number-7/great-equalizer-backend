import { MongoClient } from 'mongodb';

export const MONGO_URI = 'mongodb://root:example@localhost:27017/?authMechanism=DEFAULT';

export default class Mongo {
  client: MongoClient;

  constructor() {
    this.client = new MongoClient(MONGO_URI);
  }
}
