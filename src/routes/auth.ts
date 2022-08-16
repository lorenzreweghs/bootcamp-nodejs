import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const authRouter = express.Router();

authRouter.post('/login', (_req: Request, res: Response) => {
  const { username } = _req.body;
  const user = {
    username,
  };

  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!);

  res.json({ token });
});

export default authRouter;
