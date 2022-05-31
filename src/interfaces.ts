import { Document, WithId, MongoClient } from 'mongodb';

export interface IMongo {
  client: MongoClient;
  connect(): Promise<void>;
  seed(): Promise<void>;
  createTransaction(date: Date, name: string, value: number): Promise<string | null>;
  getTransactions(): Promise<Array<WithId<Document>> | null>;
}
