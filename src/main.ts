// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';
import express from 'express';

import authRouter from './routes/auth';
import userRouter from './routes/user';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use('/api', authRouter);
app.use('/api', userRouter);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
