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
});
