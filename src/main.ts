import express, { Request, Response } from 'express';
import { collections } from './services/database.service';

const PORT = process.env.PORT || 3000;

const app = express();

const userRouter = express.Router();

app.use(express.json());

userRouter.get('/', async (_req: Request, res: Response) => {
  try {
    // const users = (await collections.users?.find({}).toArray()) as User[];
    const users = await collections.users?.find({}).toArray();

    res.status(200).send(users);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

app.use('/api', userRouter);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
