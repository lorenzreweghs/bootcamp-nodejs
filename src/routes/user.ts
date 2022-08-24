/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
import express, { Handler } from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';
import { collections } from '../services/database.service';
import ajv from '../utils/ajv';
import { BadRequest } from '../utils/httpError';
import { validateUser } from '../validation/validators';
import { UserRequestBody } from './resources';

const userRouter = express.Router();

function guardAgainstInvalidUser(body: unknown): asserts body is UserRequestBody {
  if (!validateUser(body)) throw new BadRequest(ajv.errorsText(validateUser.errors, { dataVar: 'body' }));
}

export const registerHandler: Handler = (_req, res, next) => {
  guardAgainstInvalidUser(_req.body);
  const { password } = _req.body;

  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) return res.sendStatus(500);

    try {
      const result = await collections.users?.insertOne({
        ..._req.body,
        password: hashedPassword,
      });

      res.status(201).json({
        ..._req.body,
        id: result?.insertedId,
        password: undefined,
      });
    } catch (error) {
      next(error);
    }
  });
};

userRouter
  .route('/users')
  .get(async (_req, res, next) => {
    try {
      const users = await collections.users?.find({}).toArray();

      res.status(200).send(users);
    } catch (error) {
      next(error);
    }
  })
  .post((_req, res, next) => registerHandler(_req, res, next));

userRouter
  .route('/users/:id')
  .get(async (_req, res, next) => {
    const { id } = _req.params;

    try {
      const user = await collections.users?.findOne({ _id: new ObjectId(id) });

      if (!user) return res.sendStatus(404);

      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  })
  .put(authenticateToken, async (_req, res, next) => {
    guardAgainstInvalidUser(_req.body);
    const { id } = _req.params;
    const { password } = _req.body;

    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) return res.sendStatus(500);

      try {
        const result = await collections.users?.updateOne(
          { _id: new ObjectId(id) },
          { $set: { ..._req.body, password: hashedPassword } },
        );

        if (!result?.modifiedCount) return res.sendStatus(404);

        res.status(200).json({
          ..._req.body,
          id,
          password: undefined,
        });
      } catch (error) {
        next(error);
      }
    });
  })
  .delete(authenticateToken, async (_req, res, next) => {
    const { id } = _req.params;

    if (_req.user?.role !== 'admin') return res.sendStatus(401);

    try {
      const result = await collections.users?.deleteOne({ _id: new ObjectId(id) });

      if (!result?.deletedCount) return res.sendStatus(404);

      res.status(200).send(`User with ID ${id} deleted`);
    } catch (error) {
      next(error);
    }
  });

userRouter.post('/users/resetPassword', async (_req, res, next) => {
  const { email } = _req.body;

  if (!email) return res.sendStatus(400);

  const user = await collections.users?.findOne({ email });

  if (!user) return res.sendStatus(404);

  bcrypt.hash('Default', 10, async (err, hashedPassword) => {
    if (err) return res.sendStatus(500);

    try {
      await collections.users?.updateOne({ email }, { $set: { password: hashedPassword } });

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });
});

export default userRouter;
