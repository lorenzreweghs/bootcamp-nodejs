/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
import express, { Handler } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from '../services/database.service';

const userRouter = express.Router();

export const registerHandler: Handler = (_req, res, next) => {
  const { username, password } = _req.body;

  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) return res.sendStatus(500);

    try {
      const result = await collections.users?.insertOne({
        username,
        password: hashedPassword,
      });

      res.status(201).json({
        id: result?.insertedId,
        username,
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
    const { id } = _req.params;
    const { username, password } = _req.body;

    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) return res.sendStatus(500);

      try {
        await collections.users?.updateOne({ _id: new ObjectId(id) }, { $set: { username, password: hashedPassword } });

        res.status(200).json({
          id,
          username,
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
