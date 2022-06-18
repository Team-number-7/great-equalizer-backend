import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { IMongo, ITransactionController } from '../interfaces';
import TYPES from '../types';

@injectable()
export default class TransactionController implements ITransactionController {
  mongo: IMongo;

  constructor(
  @inject(TYPES.IMongo) mongo: IMongo,
  ) {
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
