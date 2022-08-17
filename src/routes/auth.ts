/* eslint-disable consistent-return */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';
import express, { Handler } from 'express';
import jwt from 'jsonwebtoken';
import { collections } from '../services/database.service';

const authRouter = express.Router();

let refreshTokens: string[] = [];

const generateAccessToken = (user: { username: string; password: string }) =>
  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });

const registerHandler: Handler = async (_req, res) => {
  const { username, password } = _req.body;

  await collections.users?.insertOne({});
};

authRouter.post('/register', registerHandler);

authRouter.post('/login', (_req, res) => {
  const { username, password } = _req.body;
  const user = {
    username,
    password,
  };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!);
  refreshTokens.push(refreshToken);

  res.status(200).json({ accessToken, refreshToken });
});

authRouter.post('/token', (_req, res) => {
  const { token } = _req.body;

  if (!token) return res.sendStatus(401);

  if (!refreshTokens.includes(token)) return res.sendStatus(403);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (err: jwt.VerifyErrors | null, user: any) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({
      username: user.username,
      password: user.password,
    });
    res.status(200).json({ accessToken });
  });
});

authRouter.delete('/logout', (_req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== _req.body.token);
  res.sendStatus(204);
});

export default authRouter;
