import container, {
  expressContainerModule,
  mongoContainerModule,
  transactionControllerContainerModule,
} from './inversify.config';
import Server from './Server';

container.load(mongoContainerModule, transactionControllerContainerModule, expressContainerModule);

Server.initMiddlewares();
Server.configureEndpoints();
console.log(process.env.DB_HOST);
Server.listen();

console.log(process.env.DB_HOST);
