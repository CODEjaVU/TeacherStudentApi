
import catchAsync from '../../src/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

  describe('catchAsync', () => {
    it('should call next with error when async function throws', async () => {
      const mockRequest = {} as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;
      const mockError = new Error('Test error');
      
      const asyncFunc = jest.fn().mockRejectedValueOnce(mockError);
      const wrappedFunc = catchAsync(asyncFunc);
      
      await wrappedFunc(mockRequest, mockResponse, mockNext);
      
      expect(asyncFunc).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should resolve successfully when async function does not throw', async () => {
      const mockRequest = {} as Request;
      const mockResponse = {} as Response;
      const mockNext = jest.fn() as NextFunction;
      
      const asyncFunc = jest.fn().mockResolvedValueOnce(undefined);
      const wrappedFunc = catchAsync(asyncFunc);
      
      await wrappedFunc(mockRequest, mockResponse, mockNext);
      
      expect(asyncFunc).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
