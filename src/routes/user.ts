/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
import express, { Handler } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../services/database.service';
import ajv from '../utils/ajv';
import { BadRequest } from '../utils/httpError';
import { validateUser } from '../validation/validators';
import { UserRequestBody } from './resources';

const userRouter = express.Router();

export function guardAgainstInvalidUser(body: unknown): asserts body is UserRequestBody {
  if (!validateUser(body)) throw new BadRequest(ajv.errorsText(validateUser.errors, { dataVar: 'body' }));
}

export const registerHandler: Handler = (_req, res, next) => {
  guardAgainstInvalidUser(_req.body);
  const { firstName, lastName, email, password, role } = _req.body;

  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) return res.sendStatus(500);

    try {
      const result = await collections.users?.insertOne({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      });

      res.status(201).json({
        id: result?.insertedId,
        firstName,
        lastName,
        email,
        role,
      });
    } catch (error) {
      res.sendStatus(403);
    }
  });
};

userRouter
  .route('/users')
  .get(async (_req, res) => {
    try {
      const users = await collections.users?.find({}).toArray();

      res.status(200).send(users);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  })
  .post((_req, res, next) => registerHandler(_req, res, next));

userRouter
  .route('/users/:id')
  .get(async (_req, res) => {
    const { id } = _req.params;

    try {
      const user = await collections.users?.findOne({ _id: new ObjectId(id) });

      if (!user) return res.sendStatus(404);

      res.status(200).send(user);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  })
  .put(async (_req, res) => {
    guardAgainstInvalidUser(_req.body);
    const { id } = _req.params;
    const { firstName, lastName, email, password, role } = _req.body;

    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) return res.sendStatus(500);

      try {
        await collections.users?.updateOne(
          { _id: new ObjectId(id) },
          { $set: { firstName, lastName, email, password: hashedPassword, role } },
        );

        res.status(200).json({
          id,
          firstName,
          lastName,
          email,
          role,
        });
      } catch (error: any) {
        res.status(403).send(error.message);
      }
    });
  })
  .delete(async (_req, res) => {
    const { id } = _req.params;

    try {
      await collections.users?.deleteOne({ _id: new ObjectId(id) });

      res.status(200).send(`User with ID ${id} deleted`);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

export default userRouter;
