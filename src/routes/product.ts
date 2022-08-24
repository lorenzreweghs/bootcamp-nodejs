/* eslint-disable consistent-return */
import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';
import Product from '../models/product';
import { collections } from '../services/database.service';

const productRouter = express.Router();

productRouter
  .route('/products')
  .get(async (_req, res, next) => {
    try {
      const products = await collections.products?.find<Product[]>({}).toArray();

      res.status(200).send(products);
    } catch (error) {
      next(error);
    }
  })
  .post(authenticateToken, async (_req, res, next) => {
    try {
      const result = await collections.products?.insertOne({ ..._req.body });

      res.status(201).json({
        ..._req.body,
        id: result?.insertedId,
      });
    } catch (error) {
      next(error);
    }
  });

productRouter
  .route('/products/:id')
  .get(async (_req, res, next) => {
    const { id } = _req.params;

    try {
      const product = await collections.products?.findOne<Product>({ _id: new ObjectId(id) });

      if (!product) return res.sendStatus(404);

      res.status(200).send(product);
    } catch (error) {
      next(error);
    }
  })
  .put(authenticateToken, async (_req, res, next) => {
    const { id } = _req.params;

    try {
      const result = await collections.products?.updateOne({ _id: new ObjectId(id) }, { $set: { ..._req.body } });

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
      const result = await collections.products?.deleteOne({ _id: new ObjectId(id) });

      if (!result?.deletedCount) return res.sendStatus(404);

      res.status(200).send(`Product with ID ${id} deleted`);
    } catch (error) {
      next(error);
    }
  });

export default productRouter;
