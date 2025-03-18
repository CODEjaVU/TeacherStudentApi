import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { CustomError } from '../errors/CustomError';
import { StatusCodes } from 'http-status-codes';

/**
 * Generic middleware that validates req.body, req.query, req.params
 * based on a Zod schema with shape { body?: z.ZodObject, query?: ..., params?: ... }
 */
export const validatePayload = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // const transformedErrors = error.issues.map((issue) => {
        //   const fieldPath = issue.path.join('.');
        //   return {
        //     field: fieldPath,
        //     message: issue.message,
        //   };
        // });

        //Return first error

        //return next(new CustomError('Validation Error', transformedErrors[0]));
          return next( new CustomError('Validation Error',  StatusCodes.BAD_REQUEST)); 
      }
      return next(error);
    }
  };
};