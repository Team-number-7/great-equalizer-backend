import {
  decorate, injectable, Container, ContainerModule, interfaces,
} from 'inversify';
import TYPES from './types';
import Mongo from './Mongo';
import { IMongo } from './interfaces';
import 'reflect-metadata';
import Bind = interfaces.Bind;

const container = new Container();
decorate(injectable(), Mongo);

export const mongoContainerModule = new ContainerModule((bind: Bind) => {
  const mongo = Mongo.getInstance();
  bind<IMongo>(TYPES.IMongo).toConstantValue(mongo);
});

export default container;
