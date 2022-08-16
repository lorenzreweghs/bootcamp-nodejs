/* eslint-disable consistent-return */
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const authRouter = express.Router();

let refreshTokens: string[] = [];

const generateAccessToken = (user: { username: string }) =>
  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });

authRouter.post('/login', (_req: Request, res: Response) => {
  const { username } = _req.body;
  const user = {
    username,
  };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!);
  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

authRouter.post('/token', (_req: Request, res: Response) => {
  const { token } = _req.body;

  if (!token) return res.sendStatus(401);

  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (err: jwt.VerifyErrors | null, user: any) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

authRouter.delete('/logout', (_req: Request, res: Response) => {
  refreshTokens = refreshTokens.filter((token) => token !== _req.body.token);
  res.sendStatus(204);
});

export default authRouter;
