import { Router } from 'express';
import authenticationMiddleware from 'middlewares/authentication.middleware';
import VideosRouter from './videos.routes';
import UsersRouter from './users.routes';
import isAdminMiddleware from 'middlewares/isAdmin.middleware';
import AdminsRouter from './admin.routes';

const v1Router = Router();

v1Router.use(authenticationMiddleware());
v1Router.use('/videos', VideosRouter);
v1Router.use('/users', UsersRouter);
v1Router.use('/admin', isAdminMiddleware(), AdminsRouter);

export default v1Router;
