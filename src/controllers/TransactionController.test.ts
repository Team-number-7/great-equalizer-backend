import { Request, Response } from 'express';
import TransactionController from './TransactionController';
import MockMongo from '../Mongo';

jest.mock('../Mongo');

describe('TransactionsController', () => {
  test('constructor', () => {
    // Arrange
    const mockMongo = new MockMongo();

    // Act
    const actualTransactionController = new TransactionController(mockMongo);

    // Assert
    expect(actualTransactionController.mongo).toEqual(mockMongo);
  });
  describe('createTransaction', () => {
    test('happy path', async () => {
      // Arrange
      const mockMongo = new MockMongo();
      const expectedTransactionId = '1';
      mockMongo.createTransaction = jest
        .fn(async () => expectedTransactionId);
      const transactionController = new TransactionController(mockMongo);
      const expectedDateString = '2022-05-01';
      const expectedDate = new Date(expectedDateString);
      const expectedName = 'Пиросмани';
      const expectedValue = 70;
      const expectedValueString = `${expectedValue}`;

      const expectedResponseMessage = 'Transaction added';
      const mockRequest: Request = {
        body: {
          date: expectedDateString,
          name: expectedName,
          value: expectedValueString,
        },
      } as Request;
      const mockResponse: Partial<Response> = { send: jest.fn() };

      // Act
      await transactionController.createTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(transactionController.mongo.createTransaction).toBeCalledWith(
        expectedDate,
        expectedName,
        expectedValue,
      );
      expect(mockResponse.send).toBeCalledWith(expectedResponseMessage);
    });
    test('mongo.createTransaction returnes null', async () => {
      // Arrange
      const mockMongo = new MockMongo();
      mockMongo.createTransaction = jest
        .fn(async () => null);
      const transactionController = new TransactionController(mockMongo);
      const expectedDateString = '2022-05-01';
      const expectedDate = new Date(expectedDateString);
      const expectedName = 'Пиросмани';
      const expectedValue = 70;
      const expectedValueString = `${expectedValue}`;

      const expectedStatusCode = 502;
      const mockRequest: Request = {
        body: {
          date: expectedDateString,
          name: expectedName,
          value: expectedValueString,
        },
      } as Request;
      const mockResponse: Partial<Response> = {
        sendStatus: jest.fn(),
        send: jest.fn(),
      };

      // Act
      await transactionController.createTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(transactionController.mongo.createTransaction).toBeCalledWith(
        expectedDate,
        expectedName,
        expectedValue,
      );
      expect(mockResponse.sendStatus).toBeCalledWith(expectedStatusCode);
    });
  });
});
