import {
  decorate, injectable, Container, ContainerModule, interfaces,
} from 'inversify';
import express, { Application } from 'express';
import TYPES from './types';
import Mongo from './Mongo';
import { IMongo, ITransactionController } from './interfaces';
import 'reflect-metadata';
import Bind = interfaces.Bind;
import TransactionController from './controllers/TransactionController';

const container = new Container();
decorate(injectable(), Mongo);

export const mongoContainerModule = new ContainerModule((bind: Bind) => {
  const mongo = Mongo.getInstance();
  bind<IMongo>(TYPES.IMongo).toConstantValue(mongo);
});

export const expressContainerModule = new ContainerModule((bind: Bind) => {
  const app: Application = express();
  bind<Application>(TYPES.Application).toConstantValue(app);
});

export const transactionControllerContainerModule = new ContainerModule((bind: Bind) => {
  bind<ITransactionController>(TYPES.ITransactionController).to(TransactionController);
});

export default container;
