import express from 'express';

import authRouter from './routes/auth';
import userRouter from './routes/user';

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use('/api', authRouter);
  app.use('/api', userRouter);

  return app;
};

export default createServer;
