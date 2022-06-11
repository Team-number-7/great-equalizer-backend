import dotenv from 'dotenv';
import container, {
  expressContainerModule,
  mongoContainerModule,
  transactionControllerContainerModule,
} from './inversify.config';
import Server from './Server';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
container.load(mongoContainerModule, transactionControllerContainerModule, expressContainerModule);

Server.initMiddleware();
Server.configureEndpoints();
console.log(process.env.DB_HOST);
Server.listen();

console.log(process.env.DB_HOST);
