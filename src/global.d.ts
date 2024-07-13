import { Users } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user: {
        _count: {
          videos: number;
        };
      } & Users;
    }
  }
}

export {};
