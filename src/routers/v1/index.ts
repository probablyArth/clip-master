import { Router } from 'express';
import authenticationMiddleware from 'middlewares/authentication.middleware';
import VideosRouter from './videos.routes';

const v1Router = Router();

v1Router.use(authenticationMiddleware());
v1Router.use('/videos', VideosRouter);

export default v1Router;
