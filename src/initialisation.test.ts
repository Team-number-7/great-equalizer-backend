import MockMongo from './Mongo';
import container from './inversify.config';
import { IMongo } from './interfaces';
import TYPES from './types';
import initialise from './initialisation';

jest.mock('./Mongo');

describe('initialisation', () => {
  test('happy path', async () => {
    // Arrange
    const mockMongo = new MockMongo();

    container.unbind(TYPES.IMongo);
    container.bind<IMongo>(TYPES.IMongo).toConstantValue(mockMongo);
    // Act
    await initialise();

    // Assert
    expect(mockMongo.connect).toBeCalled();
    expect(mockMongo.seed).toBeCalled();
  })
})
