import { MongoClient as MockMongoClient } from 'mongodb';
import Mongo, { MONGO_URI } from './Mongo';

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
      const expectedDb: string = 'admin';
      const expectedCommand = { ping: 1 };
      const mockCommand = jest.fn();
      mongo.client.db = jest
        .fn()
        .mockReturnValue({ command: mockCommand });

      // Act
      await mongo.connect();

      // Assert
      expect(mongo.client.connect).toBeCalled();
      expect(mongo.client.db).toBeCalledWith(expectedDb);
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
});
