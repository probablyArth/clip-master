import getEnvVar from 'env/index';
import { UnauthorizedError } from 'errors/unauthorized-error';
import { NextFunction, Request, Response } from 'express';

const isAdminMiddleware = () => async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  if (token !== getEnvVar('ADMIN_KEY')) {
    return next(new UnauthorizedError());
  }

  next();
};

export default isAdminMiddleware;
