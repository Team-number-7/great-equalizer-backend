import {
  Document, MongoClient as MockMongoClient, MongoClientOptions, ObjectId, WithId,
} from 'mongodb';
import Mongo, { MONGO_URI, DB_NAME, TRANSACTIONS_COLLECTION } from './Mongo';

jest.mock('mongodb');

describe('Mongo', () => {
  test('getInstance', () => {
    // Arrange
    const expectedUri = MONGO_URI;
    const expectedOptions: MongoClientOptions = {
      auth: {
        password: 'example',
        username: 'root',
      },
      authMechanism: 'DEFAULT',
    };

    // Act
    const actualMongo = Mongo.getInstance();

    // Assert
    expect(MockMongoClient).toBeCalledWith(expectedUri, expectedOptions);
    expect(actualMongo.client).toBeInstanceOf(MockMongoClient);
  });

  test('getInstance Singletone', () => {
    // Arrange
    const expectedMongoInstance = Mongo.getInstance();
    // Act
    const actualMongoInstance = Mongo.getInstance();

    // Assert
    expect(actualMongoInstance).toBeInstanceOf(Mongo);
    expect(actualMongoInstance).toBe(expectedMongoInstance);
  });
  describe('connect', () => {
    test('succesful connection', async () => {
      // Arrange
      const mongo = Mongo.getInstance();
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
      const mongo = Mongo.getInstance();
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
      const mongo = Mongo.getInstance();
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
      const mongo = Mongo.getInstance();
      const expectedDbName = DB_NAME;
      const expectedCollectionName = TRANSACTIONS_COLLECTION;
      const expectedDate = new Date('2022-05-01');
      const expectedName = '??????????????????';
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
      const mongo = Mongo.getInstance();
      const expectedDbName = DB_NAME;
      const expectedCollectionName = TRANSACTIONS_COLLECTION;
      const expectedDate = new Date('2022-05-01');
      const expectedName = '??????????????????';
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
  describe('getTransactions', () => {
    test('happy path', async () => {
      // Assert
      const mongo = Mongo.getInstance();
      const expectedDbName = DB_NAME;
      const expectedCollectionName = TRANSACTIONS_COLLECTION;
      const expectedTransaction1: WithId<Document> = {
        _id: new ObjectId('1'),
        date: new Date('2022-05-01'),
        name: '??????????????????',
        value: 70,
      };
      const expectedTransaction2: WithId<Document> = {
        _id: new ObjectId('2'),
        date: new Date('2007-01-01'),
        name: '????????????????????',
        value: 69,
      };
      const expectedTransactions = [expectedTransaction1, expectedTransaction2];
      const mockToArray = jest.fn(async () => expectedTransactions);
      const mockFind = jest
        .fn()
        .mockReturnValue({ toArray: mockToArray });
      const mockCollection = jest
        .fn()
        .mockReturnValue({ find: mockFind });
      mongo.client.db = jest
        .fn()
        .mockReturnValue({ collection: mockCollection });

      // Act
      const actualTransactions: Array<WithId<Document>> | null = await mongo.getTransactions();

      // Arrange
      expect(mongo.client.db).toBeCalledWith(expectedDbName);
      expect(mockCollection).toBeCalledWith(expectedCollectionName);
      expect(mockFind).toBeCalled();
      expect(actualTransactions).toEqual(expectedTransactions);
    });
    test('toArray throws exception', async () => {
      // Assert
      const mongo = Mongo.getInstance();
      const expectedDbName = DB_NAME;
      const expectedCollectionName = TRANSACTIONS_COLLECTION;
      const expectedTransactions = null;
      const mockToArray = jest.fn(async () => {
        throw new Error('Try again');
      });
      const mockFind = jest
        .fn()
        .mockReturnValue({ toArray: mockToArray });
      const mockCollection = jest
        .fn()
        .mockReturnValue({ find: mockFind });
      mongo.client.db = jest
        .fn()
        .mockReturnValue({ collection: mockCollection });

      // Act
      const actualTransactions: Array<WithId<Document>> | null = await mongo.getTransactions();

      // Arrange
      expect(mongo.client.db).toBeCalledWith(expectedDbName);
      expect(mockCollection).toBeCalledWith(expectedCollectionName);
      expect(mockFind).toBeCalled();
      expect(actualTransactions).toEqual(expectedTransactions);
    });
  });
});
