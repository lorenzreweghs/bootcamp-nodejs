import express from 'express';

import authRouter from './routes/auth';
import productRouter from './routes/product';
import userRouter from './routes/user';

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use('/api', authRouter);
  app.use('/api', userRouter);
  app.use('/api', productRouter);

  return app;
};

export default createServer;
