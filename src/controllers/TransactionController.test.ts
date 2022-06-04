import { Document, WithId, ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import TransactionController from './TransactionController';
import MockMongo from '../Mongo';

jest.mock('mongodb');
// jest.mock('../Mongo');

describe('TransactionsController', () => {
  test('constructor', () => {
    // Arrange
    const mockMongo = MockMongo.getInstance();

    // Act
    const actualTransactionController = new TransactionController(mockMongo);

    // Assert
    expect(actualTransactionController.mongo).toEqual(mockMongo);
  });
  describe('createTransaction', () => {
    test('happy path', async () => {
      // Arrange
      const mockMongo = MockMongo.getInstance();
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
      const mockMongo = MockMongo.getInstance();
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
  describe('getTransactions', () => {
    test('happy path', async () => {
      // Arrange
      const mockMongo = MockMongo.getInstance();
      const transactionController = new TransactionController(mockMongo);
      const expectedTransaction1: WithId<Document> = {
        _id: new ObjectId('1'),
        date: new Date('2022-05-01'),
        name: 'Пиросмани',
        value: 70,
      };
      const expectedTransaction2: WithId<Document> = {
        _id: new ObjectId('2'),
        date: new Date('2007-01-01'),
        name: 'Пиросмания',
        value: 69,
      };
      const expectedTransactions = [expectedTransaction1, expectedTransaction2];
      mockMongo.getTransactions = jest
        .fn(async () => expectedTransactions);

      const mockRequest: Request = {} as Request;
      const mockResponse: Partial<Response> = { json: jest.fn() };
      // Act
      await transactionController.getTransactions(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(transactionController.mongo.getTransactions).toBeCalled();
      expect(mockResponse.json).toBeCalledWith(expectedTransactions);
    });
    test('mongo.getTransaction returnes null', async () => {
      // Arrange
      const mockMongo = MockMongo.getInstance();
      const transactionController = new TransactionController(mockMongo);
      const expectedStatusCode = 502;
      mockMongo.getTransactions = jest
        .fn(async () => null);

      const mockRequest: Request = {} as Request;
      const mockResponse: Partial<Response> = { json: jest.fn(), sendStatus: jest.fn() };
      // Act
      await transactionController.getTransactions(
        mockRequest as Request,
        mockResponse as Response,
      );

      // Assert
      expect(transactionController.mongo.getTransactions).toBeCalled();
      expect(mockResponse.sendStatus).toBeCalledWith(expectedStatusCode);
    });
  });
});
