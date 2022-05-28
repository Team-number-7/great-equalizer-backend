import { MongoClient as MockMongoClient } from 'mongodb';
import Mongo, { MONGO_URI, DB_NAME, TRANSACTIONS_COLLECTION } from './Mongo';

jest.mock('mongodb');

describe('Mongo', () => {
  test('constructor', () => {
    // Arrange
    const expectedUri = MONGO_URI;

    // Act
    const actualMongo = new Mongo();

    // Assert
    expect(MockMongoClient).toBeCalledWith(expectedUri);
    expect(actualMongo.client).toBeInstanceOf(MockMongoClient);
  });
  describe('connect', () => {
    test('succesful connection', async () => {
      // Arrange
      const mongo = new Mongo();
      const expectedDbName: string = 'admin';
      const expectedCommand = { ping: 1 };
      const mockCommand = jest.fn();
      mongo.client.db = jest
        .fn()
        .mockReturnValue({ command: mockCommand });

      // Act
      await mongo.connect();

      // Assert
      expect(mongo.client.connect).toBeCalled();
      expect(mongo.client.db).toBeCalledWith(expectedDbName);
      expect(mockCommand).toBeCalledWith(expectedCommand);
    });
    test('connect throws exception', async () => {
      // Arrange
      const mongo = new Mongo();
      mongo.client.connect = jest.fn(() => {
        throw new Error();
      });

      // Act
      await mongo.connect();

      // Assert
      expect(mongo.client.connect).toBeCalled();
      expect(mongo.client.close).toBeCalled();
    });
  });
  describe('seed', () => {
    test('succesfull seed', async () => {
      // Arrange
      const mongo = new Mongo();
      const expectedDbName = DB_NAME;
      const expectedCollectionName = TRANSACTIONS_COLLECTION;
      const mockCreateCollection = jest.fn();
      mongo.client.db = jest
        .fn()
        .mockReturnValue({ createCollection: mockCreateCollection });

      // Act
      await mongo.seed();

      // Assert
      expect(mongo.client.db).toBeCalledWith(expectedDbName);
      expect(mockCreateCollection).toBeCalledWith(expectedCollectionName);
    });
  });
  describe('createTransaction', () => {
    test('happy path', async () => {
      // Arrange
      const mongo = new Mongo();
      const expectedDbName = DB_NAME;
      const expectedCollectionName = TRANSACTIONS_COLLECTION;
      const expectedDate = new Date('2022-05-01');
      const expectedName = 'Пиросмани';
      const expectedValue = 70;
      const expectedDocument = { date: expectedDate, name: expectedName, value: expectedValue };
      const expectedTransactionId = '1';
      const mockToString = jest
        .fn()
        .mockReturnValue(expectedTransactionId);
      const mockInsertOne = jest.fn(async () => ({
        insertedId: {
          toString: mockToString,
        },
      }));
      const mockCollection = jest
        .fn()
        .mockReturnValue({ insertOne: mockInsertOne });
      mongo.client.db = jest
        .fn()
        .mockReturnValue({ collection: mockCollection });

      // Act
      const actualTransactionId = await mongo.createTransaction(
        expectedDate,
        expectedName,
        expectedValue,
      );

      // Assert
      expect(mongo.client.db).toBeCalledWith(expectedDbName);
      expect(mockCollection).toBeCalledWith(expectedCollectionName);
      expect(mockInsertOne).toBeCalledWith(expectedDocument);
      expect(actualTransactionId).toEqual(expectedTransactionId);
    });
    test('insertOne throws exception', async () => {
      // Arrange
      const mongo = new Mongo();
      const expectedDbName = DB_NAME;
      const expectedCollectionName = TRANSACTIONS_COLLECTION;
      const expectedDate = new Date('2022-05-01');
      const expectedName = 'Пиросмани';
      const expectedValue = 70;
      const expectedDocument = { date: expectedDate, name: expectedName, value: expectedValue };
      const expectedTransactionId = null;
      const mockInsertOne = jest.fn(async () => {
        throw new Error('InsertOne exception');
      });
      const mockCollection = jest
        .fn()
        .mockReturnValue({ insertOne: mockInsertOne });
      mongo.client.db = jest
        .fn()
        .mockReturnValue({ collection: mockCollection });

      // Act
      const actualTransactionId = await mongo.createTransaction(
        expectedDate,
        expectedName,
        expectedValue,
      );

      // Assert
      expect(mongo.client.db).toBeCalledWith(expectedDbName);
      expect(mockCollection).toBeCalledWith(expectedCollectionName);
      expect(mockInsertOne).toBeCalledWith(expectedDocument);
      expect(actualTransactionId).toEqual(expectedTransactionId);
    });
  });
});
