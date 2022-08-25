import express from 'express';

import authRouter from './routes/auth';
import basketRouter from './routes/basket';
import productRouter from './routes/product';
import userRouter from './routes/user';

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use('/api', authRouter);
  app.use('/api', userRouter);
  app.use('/api', productRouter);
  app.use('/api', basketRouter);

  return app;
};

export default createServer;
