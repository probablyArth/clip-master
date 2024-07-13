import { InternalServerError } from 'errors/internal-server-error';
import { RequestValidationError } from 'errors/request-validation-error';
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequestParams = (schema: AnyZodObject) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return next(new RequestValidationError(e));
      }
      next(new InternalServerError());
    }
  };
};
