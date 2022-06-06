import container, { mongoContainerModule } from './inversify.config';
import { IMongo } from './interfaces';
import TYPES from './types';
import Mongo from './Mongo';

describe('container get tits', () => {
  beforeEach(() => {
    container.load(mongoContainerModule);
  });

  afterEach(() => {
    container.unload(mongoContainerModule);
  });
  test('container get test', () => {
    // Arrange
    const expectedMongoInstance = container.get<IMongo>(TYPES.IMongo);
    // Act
    const actualMongoInstance = container.get<IMongo>(TYPES.IMongo);

    // Assert
    expect(actualMongoInstance).toBeInstanceOf(Mongo);
    expect(actualMongoInstance).toBe(expectedMongoInstance);
  });
});
