import supertest from 'supertest';
import app from './server';

describe('app.get with test', () => {
  test('get the test endpoint', async () => {
    // Arrange
    const request = supertest(app);
    const expectedStatus = 200;
    const expectedMessage = 'pass!';

    // Act
    const actualResponse = await request.get('/test');

    // Assert
    expect(actualResponse.status).toBe(expectedStatus);
    expect(actualResponse.body.message).toBe(expectedMessage);
  });
});
