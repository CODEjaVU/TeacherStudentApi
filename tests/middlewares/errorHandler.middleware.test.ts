import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { errorHandler } from '../../src/middlewares/errorHandler.middleware';
import { CustomError } from '../../src/errors/CustomError';
import logger from '../../src/configs/logger';

// Mock dependencies
jest.mock('../configs/logger', () => ({
  error: jest.fn(),
  info: jest.fn()
}));


describe('errorHandler', () => {
    
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;
  
    beforeEach(() => {
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
  
      // Reset environment variables
      process.env.NODE_ENV = 'test';
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should handle CustomError with proper status code', () => {
        // Arrange
        const customError = new CustomError('Custom error message', StatusCodes.BAD_REQUEST);
        
        // Act
        errorHandler(
        customError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
        );
        
        // Assert
        expect(logger.error).toHaveBeenCalledWith(customError);
        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
        expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom error message'
        });
    });

    it('should handle regular Error with 500 status code', () => {
        // Arrange
        const regularError = new Error('Regular error message');
        
        // Act
        errorHandler(
        regularError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
        );
        
        // Assert
        expect(logger.error).toHaveBeenCalledWith(regularError);
        expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Regular error message'
        });
    });

    it('should include stack trace in development mode', () => {
        // Arrange
        process.env.NODE_ENV = 'development';
        const error = new Error('Test error');
        error.stack = 'Test stack trace';
        
        // Act
        errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
        );
        
        // Assert
        expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test error',
        stack: 'Test stack trace'
        });
    });
});
