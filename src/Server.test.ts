import mockBodyParser from 'body-parser';
import mockExpress, { Application } from 'express';
import container, { expressContainerModule } from './inversify.config';
import TYPES from './types';
import Server from './Server';

jest.mock('body-parser', () => ({
  urlencoded: jest.fn(),
  json: jest.fn(),
}));

describe('server', () => {
  beforeEach(() => {
    container.load(expressContainerModule);
  });

  afterEach(() => {
    container.unload(expressContainerModule);
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
});
