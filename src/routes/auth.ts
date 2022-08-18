/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { collections } from '../services/database.service';

const authRouter = express.Router();

let refreshTokens: string[] = [];

const generateAccessToken = (user: { username: string; password: string }) =>
  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });

authRouter.post('/login', async (_req, res) => {
  const { username, password } = _req.body;
  const user = {
    username,
    password,
  };

  const userDoc = await collections.users?.findOne({ username });
  if (!userDoc) return res.sendStatus(404);

  bcrypt.compare(password, userDoc.password, (err, result) => {
    if (err) return res.sendStatus(500);
    if (!result) return res.sendStatus(403);
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!);
  refreshTokens.push(refreshToken);

  res.status(200).json({ accessToken, refreshToken });
});

authRouter.post('/token', (_req, res) => {
  const { refreshToken } = _req.body;

  if (!refreshToken) return res.sendStatus(401);

  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err: jwt.VerifyErrors | null, user: any) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({
      username: user.username,
      password: user.password,
    });
    res.status(200).json({ accessToken });
  });
});

authRouter.delete('/logout', (_req, res) => {
  const { refreshToken } = _req.body;

  if (!refreshToken) return res.sendStatus(401);

  refreshTokens = refreshTokens.filter((token) => token !== _req.body.token);
  res.sendStatus(204);
});

export default authRouter;
