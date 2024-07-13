import prismaClient from 'apps/database';
import { InternalServerError } from 'errors/internal-server-error';
import { Router } from 'express';

const UsersRouter = Router();

UsersRouter.get('/me', async (req, res, next) => {
  try {
    return res.json(await prismaClient.users.findUnique({ where: { id: req.user.id } }));
  } catch (_) {
    next(new InternalServerError());
  }
});

export default UsersRouter;
