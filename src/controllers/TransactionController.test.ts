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
    test('happy path', () => {
      // Arrange
      const mockMongo = new MockMongo();
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
      transactionController.createTransaction(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(transactionController.mongo.createTransaction).toBeCalledWith(
        expectedDate,
        expectedName,
        expectedValue,
      );
      expect(mockResponse.send).toBeCalledWith(expectedResponseMessage);
    });
  });
});
