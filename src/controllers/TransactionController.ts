import { Request, Response } from 'express';
import Mongo from '../Mongo';

export default class TransactionController {
  mongo: Mongo;

  constructor(mongo: Mongo) {
    this.mongo = mongo;
  }

  async createTransaction(req: Request, res: Response) {
    const date: string = req.body.date as string;
    const name: string = req.body.name as string;
    const value: string = req.body.value as string;
    if (await this.mongo.createTransaction(new Date(date), name, parseInt(value, 10))) {
      res.send('Transaction added');
    } else {
      res.sendStatus(502);
    }
  }

  async getTransactions(req: Request, res: Response) {
    const transactions = await this.mongo.getTransactions();
    if (transactions) {
      res.json(transactions);
    } else {
      res.sendStatus(502);
    }
  }
}
