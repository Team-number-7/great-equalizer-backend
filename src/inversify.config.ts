import { decorate, injectable, Container } from 'inversify';
import TYPES from './types';
import Mongo from './Mongo';
import { IMongo } from './interfaces';
import 'reflect-metadata';

const container = new Container();
decorate(injectable(), Mongo);
container.bind<IMongo>(TYPES.IMongo).to(Mongo);

export default container;
