import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { collections } from '../services/database.service';

const userRouter = express.Router();

userRouter.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    // const users = (await collections.users?.find({}).toArray()) as User[];
    const users = await collections.users?.find({}).toArray();

    res.status(200).send(users);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

export default userRouter;
