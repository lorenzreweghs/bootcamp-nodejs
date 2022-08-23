/* eslint-disable consistent-return */
import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth';
import { collections } from '../services/database.service';

const productRouter = express.Router();

productRouter
  .route('/products')
  .get(async (_req, res) => {
    try {
      const products = await collections.products?.find({}).toArray();

      res.status(200).send(products);
    } catch (error: any) {
      res.send(500).send(error.message);
    }
  })
  .post(authenticateToken, async (_req, res) => {
    try {
      const result = await collections.products?.insertOne({ ..._req.body });

      res.send(201).json({
        id: result?.insertedId,
        ..._req.body,
      });
    } catch (error) {
      res.sendStatus(403);
    }
  });

productRouter
  .route('/products/:id')
  .get(async (_req, res) => {
    const { id } = _req.params;

    try {
      const product = await collections.products?.findOne({ _id: new ObjectId(id) });

      if (!product) return res.sendStatus(404);

      res.status(200).send(product);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  })
  .put(authenticateToken, async (_req, res) => {
    const { id } = _req.params;

    try {
      await collections.products?.updateOne({ _id: new ObjectId(id) }, { $set: { ..._req.body } });

      res.status(200).json({
        id,
        ..._req.body,
      });
    } catch (error: any) {
      res.status(403).send(error.message);
    }
  })
  .delete(authenticateToken, async (_req, res) => {
    const { id } = _req.params;

    try {
      await collections.products?.deleteOne({ _id: new ObjectId(id) });

      res.status(200).send(`Product with ID ${id} deleted`);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });
