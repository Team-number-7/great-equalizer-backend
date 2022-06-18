import { Request, Response } from 'express';
import Healthcheck from './HealthcheckController';

describe('Healthcheck', () => {
  test('healthcheck', () => {
    // Arrange
    const expectedMessage = 'vsyo ok';
    const mockRequest: Request = {} as Request;
    const mockResponse: Partial<Response> = { send: jest.fn() };

    // Act
    Healthcheck.healthcheck(
      mockRequest as Request,
      mockResponse as Response,
    );

    // Assert
    expect(mockResponse.send).toBeCalledWith(expectedMessage);
  });
});
