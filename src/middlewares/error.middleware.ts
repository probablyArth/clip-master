import { CustomError } from 'errors/custom-error';
import { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';

const error = () => {
  return (err: CustomError | MulterError, _: Request, res: Response, __: NextFunction) => {
    if (err instanceof MulterError) {
      return res.status(400).json({ code: 400, reasons: [{ message: err.message }] });
    }
    return res.status(err.statusCode).json({ code: err.statusCode, reasons: err.serializeErrors() });
  };
};

export default error;
