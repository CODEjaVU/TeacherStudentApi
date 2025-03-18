import { z } from 'zod';
import { validatePayload } from '../../src/middlewares/validation.middleware';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { CustomError } from '../../src/errors/CustomError'; 

describe('validatePayload', () => {
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

    it('should call next when validation passes', () => {
        // Arrange
        mockRequest.body = { name: 'Test' };
        const schema = z.object({
            body: z.object({
                name: z.string()
            })
        });
        const validateMiddleware = validatePayload(schema);

        // Act
        validateMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext.mock.calls[0].length).toBe(0); // No arguments passed to next
    });

    it('should call next with CustomError when validation fails', () => {
        // Arrange
        mockRequest.body = { name: 123 }; // Invalid type
        const schema = z.object({
            body: z.object({
                name: z.string()
            })
        });
        const validateMiddleware = validatePayload(schema);

        // Act
        validateMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe('Validation Error');
        expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should pass through non-Zod errors', () => {
        // Arrange
        const schema = z.object({
            body: z.object({
                name: z.string()
            })
        });
        const originalError = new Error('Original error');

        // Mock schema.parse to throw a non-Zod error
        jest.spyOn(schema, 'parse').mockImplementationOnce(() => {
            throw originalError;
        });

        const validateMiddleware = validatePayload(schema);

        // Act
        validateMiddleware(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        // Assert
        expect(mockNext).toHaveBeenCalledWith(originalError);
    });
});