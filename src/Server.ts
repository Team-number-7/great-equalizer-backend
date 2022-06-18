import { Application } from 'express';
import bodyParser from 'body-parser';
import TYPES from './types';
import container from './inversify.config';
import { IMongo, ITransactionController } from './interfaces';
import HealthcheckController from './controllers/HealthcheckController';

export const TRANSACTIONS_ENDPOINT = '/transactions';
export const HEALTHCHECK_ENDPOINT = '/health';
export const PORT = 3000;

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
    app.get(TRANSACTIONS_ENDPOINT, transactionController.getTransactions.bind(transactionController));
    app.post(TRANSACTIONS_ENDPOINT, transactionController.createTransaction.bind(transactionController));
    app.get(HEALTHCHECK_ENDPOINT, HealthcheckController.healthcheck);
  }

  static listen() {
    const app = container.get<Application>(TYPES.Application);
    app.listen(PORT, Server.initialise);
  }

  static async initialise() {
    const mongo = container.get<IMongo>(TYPES.IMongo);
    await mongo.connect();
    await mongo.seed();
  }
}
