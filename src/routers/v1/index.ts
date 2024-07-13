import { Router } from 'express';
import authenticationMiddleware from 'middlewares/authentication.middleware';

const v1Router = Router();

v1Router.use(authenticationMiddleware());

export default v1Router;
