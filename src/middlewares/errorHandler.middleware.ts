import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from '../errors/CustomError';
import logger from '../configs/logger';
export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 (Internal Server Error) if no status code is provided
  const statusCode = err instanceof CustomError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;

  // Log the error for debugging
  logger.error(err);

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace in development
  });
};