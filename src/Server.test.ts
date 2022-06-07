import mockBodyParser from 'body-parser';
import mockExpress, { Application } from 'express';
import container, {
  expressContainerModule,
  transactionControllerContainerModule,
} from './inversify.config';
import TYPES from './types';
import Server, { TRANSACTIONS_ENDPOINT } from './Server';
import { ITransactionController } from './interfaces';

jest.mock('body-parser', () => ({
  urlencoded: jest.fn(),
  json: jest.fn(),
}));

describe('server', () => {
  beforeEach(() => {
    container.load(expressContainerModule, transactionControllerContainerModule);
  });

  afterEach(() => {
    container.unload(expressContainerModule, transactionControllerContainerModule);
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

    // Act
    Server.configureEndpoints();

    // Assert
    expect(mockApp.get).toBeCalledWith(
      expectedTransactionsEndpoint,
      mockTransactionController.getTransactions,
    );
    expect(mockApp.post).toBeCalledWith(
      expectedTransactionsEndpoint,
      mockTransactionController.createTransaction,
    );
  });
});
