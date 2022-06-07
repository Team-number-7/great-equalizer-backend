import container, {
  mongoContainerModule,
  transactionControllerContainerModule,
} from './inversify.config';
import { IMongo, ITransactionController } from './interfaces';
import TYPES from './types';
import Mongo from './Mongo';
import TransactionController from './controllers/TransactionController';

describe('container get tits', () => {
  beforeEach(() => {
    container.load(mongoContainerModule, transactionControllerContainerModule);
  });

  afterEach(() => {
    container.unload(mongoContainerModule, transactionControllerContainerModule);
  });
  test('container get mongo', () => {
    // Arrange
    const expectedMongoInstance = container.get<IMongo>(TYPES.IMongo);
    // Act
    const actualMongoInstance = container.get<IMongo>(TYPES.IMongo);

    // Assert
    expect(actualMongoInstance).toBeInstanceOf(Mongo);
    expect(actualMongoInstance).toBe(expectedMongoInstance);
  });
  test('container get transactionController', () => {
    // Arrange
    const mockMongo = Mongo.getInstance();
    // Act
    const actualTransactionController = container
      .get<ITransactionController>(TYPES.ITransactionController);
    // Assert
    expect(actualTransactionController).toBeInstanceOf(TransactionController);
    expect(actualTransactionController.mongo).toBe(mockMongo);
    expect(actualTransactionController.mongo).toBeInstanceOf(Mongo);
  });
});
