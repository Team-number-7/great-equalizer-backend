import container, {
  expressContainerModule,
  mongoContainerModule,
  transactionControllerContainerModule,
} from './inversify.config';
import Server from './Server';

container.load(mongoContainerModule, transactionControllerContainerModule, expressContainerModule);

Server.initMiddleware();
Server.configureEndpoints();
Server.listen();
