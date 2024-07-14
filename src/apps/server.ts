import Express from 'express';
import error from 'middlewares/error.middleware';
import logger from 'middlewares/logger.middleware';
import v1Router from 'routers/v1';

const expressApp = Express();

expressApp.use(logger());
expressApp.use(Express.json());
expressApp.use(Express.static('public'));
expressApp.use('/api/v1', v1Router, error());

expressApp.get('/health', (_, res) => {
  return res.sendStatus(200);
});

expressApp.get('/', (_, res) => {
  return res.sendStatus(200);
});

export default expressApp;
