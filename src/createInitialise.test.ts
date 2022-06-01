import container, { mongoContainerModule } from './inversify.config';
import { IMongo } from './interfaces';
import TYPES from './types';
import createInitialise from './createInitialise';

describe('createInitialise', () => {
  beforeEach(() => {
    container.load(mongoContainerModule);
  });

  afterEach(() => {
    container.unload(mongoContainerModule);
  });

  test('happy path', async () => {
    // Arrange
    const MockMongo = jest.fn<IMongo, any>();
    container.unbind(TYPES.IMongo);
    container.bind<IMongo>(TYPES.IMongo).toConstantValue(new MockMongo());
    const mockMongo = container.get<IMongo>(TYPES.IMongo);
    mockMongo.connect = jest.fn();
    mockMongo.seed = jest.fn();
    const initialise = createInitialise();

    // Act
    await initialise();

    // Assert
    expect(mockMongo.connect).toBeCalled();
    expect(mockMongo.seed).toBeCalled();
  });
});
