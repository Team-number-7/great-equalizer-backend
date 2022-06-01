import container, { mongoContainer } from './inversify.config';
import { IMongo } from './interfaces';
import TYPES from './types';
import initialisation from './initialisation';
// import { Container } from 'inversify';

// jest.mock('./Mongo');

// let container: Container;

describe('initialisation', () => {
  beforeEach(() => {
    // container = new Container();
    container.load(mongoContainer);
  });

  // afterEach(() => {
  //   container = null;
  // });

  test('happy path', async () => {
    // Arrange
    const MockMongo = jest.fn<IMongo, any>();
    container.unbind(TYPES.IMongo);
    container.bind<IMongo>(TYPES.IMongo).toConstantValue(new MockMongo());
    const mockMongo = container.get<IMongo>(TYPES.IMongo);
    mockMongo.connect = jest.fn();
    mockMongo.seed = jest.fn();
    const initialise = initialisation();

    // Act
    await initialise();

    // Assert
    expect(mockMongo.connect).toBeCalled();
    expect(mockMongo.seed).toBeCalled();
  })
})
