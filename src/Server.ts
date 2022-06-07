import { Application } from 'express';
import bodyParser from 'body-parser';
import TYPES from './types';
import container from './inversify.config';
import { ITransactionController } from './interfaces';

export const TRANSACTIONS_ENDPOINT = '/transactions';

export default class Server {
  static initMiddleware() {
    const app = container.get<Application>(TYPES.Application);
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
  }

  static configureEndpoints() {
    const app = container.get<Application>(TYPES.Application);
    const transactionController = container
      .get<ITransactionController>(TYPES.ITransactionController);
    app.get(TRANSACTIONS_ENDPOINT, transactionController.getTransactions);
    app.post(TRANSACTIONS_ENDPOINT, transactionController.createTransaction);
  }
}
