/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import User from '../models/user';
import { collections } from '../services/database.service';
import { TokenBody, UserResponseBody } from './resources';

const authRouter = express.Router();

const mapToResource: (user: User) => UserResponseBody = ({ _id, firstName, lastName, email, role }) => {
  const resource: UserResponseBody = {
    id: _id,
    firstName,
    lastName,
    email,
    role,
  };

  return resource;
};

export const generateAccessToken = (user: { email: string; password: string }) =>
  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });

authRouter.post('/login', async (_req, res) => {
  const { email, password } = _req.body;

  if (!email || !password) return res.sendStatus(400);

  const user = {
    email,
    password,
  };

  const userDoc = await collections.users?.findOne<User>({ email }).catch((err: any) => {
    res.status(404).send(err.message);
  });
  if (!userDoc) return res.sendStatus(404);

  bcrypt.compare(password, userDoc.password, async (err, result) => {
    if (err) return res.sendStatus(500);
    if (!result) return res.sendStatus(403);

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!);

    const { id } = mapToResource(userDoc);
    try {
      await collections.tokens?.insertOne({ user_id: id, refreshToken });
    } catch (error: any) {
      res.status(400).send(error.message);
    }

    res.status(200).json({ accessToken, refreshToken });
  });
});

authRouter.post('/token', async (_req, res) => {
  const { refreshToken } = _req.body;

  if (!refreshToken) return res.sendStatus(400);

  const allTokens = await collections.tokens?.find({}).toArray();

  let tokenExists = false;
  allTokens?.forEach((token) => {
    if (token.refreshToken === refreshToken) tokenExists = true;
  });

  if (!tokenExists) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err: jwt.VerifyErrors | null, user: any) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({
      email: user.email,
      password: user.password,
    });
    res.status(200).json({ accessToken });
  });
});

authRouter.delete('/logout', async (_req, res) => {
  const { email } = _req.body;

  if (!email) return res.sendStatus(400);

  const user = await collections.users?.findOne<User>({ email });
  const userResource = mapToResource(user!);

  const allTokens = await collections.tokens?.find<TokenBody>({}).toArray();

  let tokenMatch = '';
  allTokens?.forEach((token) => {
    if (new ObjectId(userResource.id).equals(token.user_id)) {
      tokenMatch = token.refreshToken;
    }
  });

  if (!tokenMatch) return res.sendStatus(403);

  try {
    await collections.tokens?.deleteOne({ tokenMatch });
    res.sendStatus(204);
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});

export default authRouter;
