import mockBodyParser from 'body-parser';
import mockExpress, { Application } from 'express';
import container, {
  expressContainerModule, mongoContainerModule,
  transactionControllerContainerModule,
} from './inversify.config';
import TYPES from './types';
import Server, { PORT, TRANSACTIONS_ENDPOINT } from './Server';
import { IMongo, ITransactionController } from './interfaces';

jest.mock('body-parser', () => ({
  urlencoded: jest.fn(),
  json: jest.fn(),
}));

describe('server', () => {
  beforeEach(() => {
    container.load(
      mongoContainerModule,
      expressContainerModule,
      transactionControllerContainerModule,
    );
  });

  afterEach(() => {
    container.unload(
      mongoContainerModule,
      expressContainerModule,
      transactionControllerContainerModule,
    );
  });

  test('initMiddleware', () => {
    // Arrange
    const mockApp = mockExpress();
    container.unbind(TYPES.Application);
    container.bind<Application>(TYPES.Application).toConstantValue(mockApp);

    const expectedUrlencodedMiddleware = mockBodyParser.urlencoded({ extended: false });
    const expectedJsonMiddleware = mockBodyParser.json();
    mockApp.use = jest.fn();

    // Act
    Server.initMiddleware();

    // Assert
    expect(mockApp.use).toBeCalledWith(expectedUrlencodedMiddleware);
    expect(mockApp.use).toBeCalledWith(expectedJsonMiddleware);
  });

  test('Configure EndPoints', () => {
    // Arrange
    const mockApp = mockExpress();
    container.unbind(TYPES.Application);
    container.bind<Application>(TYPES.Application).toConstantValue(mockApp);

    const expectedTransactionsEndpoint = TRANSACTIONS_ENDPOINT;
    const MockTransactionController = jest.fn<ITransactionController, any>();
    container.unbind(TYPES.ITransactionController);
    container.bind<ITransactionController>(TYPES.ITransactionController)
      .toConstantValue(new MockTransactionController());
    const mockTransactionController = container
      .get<ITransactionController>(TYPES.ITransactionController);

    mockApp.get = jest.fn();
    mockApp.post = jest.fn();

    const boundGetTransactions = jest.fn();
    const boundCreateTransaction = jest.fn();
    mockTransactionController.getTransactions = async () => {};

    mockTransactionController.getTransactions.bind = jest
      .fn()
      .mockReturnValue(boundGetTransactions);
    mockTransactionController.createTransaction = async () => {};
    mockTransactionController.createTransaction.bind = jest
      .fn()
      .mockReturnValue(boundCreateTransaction);

    // Act
    Server.configureEndpoints();

    // Assert
    expect(mockApp.get).toBeCalledWith(
      expectedTransactionsEndpoint,
      boundGetTransactions,
    );
    expect(mockApp.post).toBeCalledWith(
      expectedTransactionsEndpoint,
      boundCreateTransaction,
    );
    expect(mockTransactionController.getTransactions.bind).toBeCalledWith(mockTransactionController);
    expect(mockTransactionController.createTransaction.bind).toBeCalledWith(mockTransactionController);
  });
  test('listen', () => {
    // Arrange
    const mockApp = mockExpress();
    container.unbind(TYPES.Application);
    container.bind<Application>(TYPES.Application).toConstantValue(mockApp);

    const expectedPortNumber = PORT;
    mockApp.listen = jest.fn();
    // Act
    Server.listen();
    // Assert
    expect(mockApp.listen).toBeCalledWith(expectedPortNumber, Server.initialise);
  });
  test('initialise', async () => {
    // Arrange
    const MockMongo = jest.fn<IMongo, any>();
    container.unbind(TYPES.IMongo);
    container.bind<IMongo>(TYPES.IMongo).toConstantValue(new MockMongo());
    const mockMongo = container.get<IMongo>(TYPES.IMongo);
    mockMongo.connect = jest.fn();
    mockMongo.seed = jest.fn();

    // Act
    await Server.initialise();

    // Assert
    expect(mockMongo.connect).toBeCalled();
    expect(mockMongo.seed).toBeCalled();
  });
});
