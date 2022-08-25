/* eslint-disable consistent-return */
import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';
import Basket from '../models/basket';
import { collections } from '../services/database.service';
import ajv from '../utils/ajv';
import { BadRequest } from '../utils/httpError';
import { validateBasket } from '../validation/validators';
import { BasketRequestBody } from './resources';

const basketRouter = express.Router();

function guardAgainstInvalidBasket(body: unknown): asserts body is BasketRequestBody {
  if (!validateBasket(body)) throw new BadRequest(ajv.errorsText(validateBasket.errors, { dataVar: 'body' }));
}

basketRouter
  .route('/baskets')
  .get(authenticateToken, async (_req, res, next) => {
    if (_req.user?.role !== 'admin') return res.sendStatus(401);

    try {
      const baskets = await collections.baskets?.find<Basket[]>({}).toArray();

      res.status(200).send(baskets);
    } catch (error) {
      next(error);
    }
  })
  .post(authenticateToken, async (_req, res, next) => {
    guardAgainstInvalidBasket(_req.body);

    try {
      const result = await collections.baskets?.insertOne({ ..._req.body });

      res.status(201).json({
        ..._req.body,
        id: result?.insertedId,
      });
    } catch (error) {
      next(error);
    }
  });

basketRouter
  .route('/baskets/:id')
  .get(async (_req, res, next) => {
    const { id } = _req.params;

    try {
      const basket = await collections.baskets?.findOne<Basket>({ _id: new ObjectId(id) });

      if (!basket) return res.sendStatus(404);

      res.status(200).send(basket);
    } catch (error) {
      next(error);
    }
  })
  .put(authenticateToken, async (_req, res, next) => {
    guardAgainstInvalidBasket(_req.body);
    const { id } = _req.params;

    try {
      const result = await collections.baskets?.updateOne({ _id: new ObjectId(id) }, { $set: { ..._req.body } });

      if (!result?.modifiedCount) return res.sendStatus(404);

      res.status(200).json({
        ..._req.body,
        id,
      });
    } catch (error) {
      next(error);
    }
  })
  .delete(authenticateToken, async (_req, res, next) => {
    const { id } = _req.params;

    try {
      const result = await collections.baskets?.deleteOne({ _id: new ObjectId(id) });

      if (!result?.deletedCount) return res.sendStatus(404);

      res.status(200).send(`Basket with ID ${id} deleted`);
    } catch (error) {
      next(error);
    }
  });

export default basketRouter;
