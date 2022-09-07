import { Document, WithId, MongoClient } from 'mongodb';
import { Request, Response } from 'express';

export interface IMongo {
  client: MongoClient;
  connect(): Promise<void>;
  seed(): Promise<void>;
  createTransaction(date: Date, name: string, value: number): Promise<string | null>;
  getTransactions(): Promise<Array<WithId<Document>> | null>;
  createUser(username: string, email: string, password: string): Promise<string | null>;
}

export interface ITransactionController {
  mongo: IMongo;
  createTransaction(req: Request, res: Response): Promise<void>;
  getTransactions(req: Request, res: Response): Promise<void>;
}
