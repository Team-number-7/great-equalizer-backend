import { Application } from 'express';
import bodyParser from 'body-parser';
import TYPES from './types';
import container from './inversify.config';

export default class Server {
  static initMiddleware() {
    const app = container.get<Application>(TYPES.Application);
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
  }
}
