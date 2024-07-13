import prismaClient from 'apps/database';
import { BadRequestError } from 'errors/file-validation-error';
import { InternalServerError } from 'errors/internal-server-error';
import { NotFoundError } from 'errors/not-found-error';
import { Router } from 'express';
import { z } from 'zod';

const AdminsRouter = Router();

const POSTuserBody = z.object({ name: z.string(), api_key: z.string(), limit: z.number() });
type POSTuserBodyT = z.infer<typeof POSTuserBody>;

AdminsRouter.post('/user', async (req, res, next) => {
  try {
    const { api_key, limit, name } = req.body as POSTuserBodyT;
    const user = await prismaClient.users.findFirst({ where: { api_key } });
    if (user) {
      return next(new BadRequestError('Api Key already exists'));
    }
    await prismaClient.users.create({
      data: {
        api_key,
        limit,
        name,
      },
    });
    res.sendStatus(201);
  } catch (_) {
    next(new InternalServerError());
  }
});

const DELETEuserParams = z.object({ userId: z.string() });
type DELETEuserParamsT = z.infer<typeof DELETEuserParams>;
AdminsRouter.delete('/user/:userId', async (req, res, next) => {
  const { userId } = req.params as DELETEuserParamsT;
  try {
    const user = await prismaClient.users.findFirst({ where: { id: userId } });
    if (!user) {
      return next(new NotFoundError());
    }
    await prismaClient.users.delete({
      where: {
        id: userId,
      },
    });
    res.sendStatus(204);
  } catch (_) {
    next(new InternalServerError());
  }
});

export default AdminsRouter;
