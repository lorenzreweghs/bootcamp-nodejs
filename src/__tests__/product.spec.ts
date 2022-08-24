import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import Product from '../models/product';
import { generateAccessToken } from '../routes/auth';
import createServer from '../server';
import { collections, connectToDatabase } from '../services/database.service';

describe('products', () => {
  const app = createServer();

  const orangeObjectId = new ObjectId();
  const appleObjectId = new ObjectId();
  const pearObjectId = new ObjectId();
  const bananaObjectId = new ObjectId();

  const orangeInput = {
    _id: orangeObjectId,
    name: 'Orange',
    description: 'Verassend fris',
    price: 2.0,
    discount: 0.5,
    category: 'Fruit',
    stock: 25,
  };

  const appleDoc = {
    _id: appleObjectId,
    name: 'Appel',
    description: 'Heerlijk sappig',
    price: 1.0,
    discount: 0.1,
    category: 'Fruit',
    stock: 14,
  };

  const pearDoc = {
    _id: pearObjectId,
    name: 'Peer',
    description: 'Fijne textuur',
    price: 1.5,
    discount: 0.3,
    category: 'Fruit',
    stock: 8,
  };

  const bananaDoc = {
    _id: bananaObjectId,
    name: 'Banaan',
    description: 'Perfecte kromming',
    price: 0.9,
    discount: 0.2,
    category: 'Fruit',
    stock: 3,
  };

  beforeAll(async () => {
    await connectToDatabase().connect();

    try {
      await collections.products?.deleteMany({});

      await collections.products?.insertMany([appleDoc, pearDoc, bananaDoc]);
    } catch (err) {
      console.log(err);
    }
  });

  afterAll(async () => {
    await connectToDatabase().disconnect();
  });

  describe('GET product', () => {
    describe('given the user gets a product with an existing ID', () => {
      it('should return statusCode 200 and the requested product', async () => {
        const { statusCode, body } = await supertest(app).get(`/api/products/${appleObjectId}`);

        expect(statusCode).toBe(200);
        expect(body).toEqual({ ...appleDoc, _id: appleObjectId.toString() });
      });
    });

    describe('given the user gets a product with an unexisting ID', () => {
      it('should return statusCode 404', async () => {
        const { statusCode, body } = await supertest(app).get(`/api/products/${new ObjectId(123)}`);

        expect(statusCode).toBe(404);
        expect(body).toEqual({});
      });
    });

    describe('given the user gets a product with an invalid ID', () => {
      it('should return statusCode 500', async () => {
        const { statusCode, body } = await supertest(app).get('/api/products/abc');

        expect(statusCode).toBe(500);
        expect(body).toEqual({});
      });
    });
  });

  describe('GET products', () => {
    describe('given the user gets all products', () => {
      it('should return statusCode 200 and an array of products', async () => {
        const { statusCode, body } = await supertest(app).get('/api/products');

        expect(statusCode).toBe(200);
        expect(body).toEqual([
          { ...appleDoc, _id: appleObjectId.toString() },
          { ...pearDoc, _id: pearObjectId.toString() },
          { ...bananaDoc, _id: bananaObjectId.toString() },
        ]);
      });
    });
  });

  describe('POST product', () => {
    describe('given the user adds a product with a valid body & token', () => {
      it('should return statusCode 201 and the added product', async () => {
        const { statusCode, body } = await supertest(app)
          .post('/api/products')
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          )
          .send(orangeInput);

        expect(statusCode).toBe(201);
        expect(body).toEqual({ ...orangeInput, _id: orangeObjectId.toString(), id: orangeObjectId.toString() });

        const orangeDoc = await collections.products?.findOne<Product>({ _id: orangeObjectId.toString() });
        expect(orangeDoc).toBeDefined();
        expect(orangeDoc).toEqual({ ...orangeInput, _id: orangeObjectId.toString() });
      });
    });

    describe('given the user adds a product without a valid accessToken', () => {
      it('should return statusCode 403', async () => {
        const { statusCode, body } = await supertest(app)
          .post('/api/products')
          .set('Authorization', 'Bearer 12345')
          .send(orangeInput);

        expect(statusCode).toBe(403);
        expect(body).toEqual({});
      });
    });

    describe('given the user adds a product without an accessToken', () => {
      it('should return statusCode 401', async () => {
        const { statusCode, body } = await supertest(app).post('/api/products').send(orangeInput);

        expect(statusCode).toBe(401);
        expect(body).toEqual({});
      });
    });

    describe('given the user sends a POST request with an invalid product body', () => {});
  });

  describe('PUT product', () => {
    describe('given the user updates a product with a valid ID, body & token', () => {
      it('should return statusCode 200 and the updated product', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`/api/products/${pearObjectId}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          )
          .send({ ...pearDoc, _id: undefined, price: 5.0, discount: 2.0 });

        expect(statusCode).toBe(200);
        expect(body).toEqual({ ...pearDoc, price: 5.0, discount: 2.0, _id: undefined, id: pearObjectId.toString() });
      });
    });

    describe('given the user updates a product without a valid ID', () => {
      it('should return statusCode 404', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`/api/products/${new ObjectId(123)}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          )
          .send({ ...pearDoc, _id: undefined, price: 5.0, discount: 2.0 });

        expect(statusCode).toBe(404);
        expect(body).toEqual({});
      });
    });

    describe('given the user updates a product without a valid accessToken', () => {
      it('should return statusCode 403', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`/api/products/${pearObjectId}`)
          .set('Authorization', 'Bearer 12345')
          .send({ ...pearDoc, _id: undefined, price: 5.0, discount: 2.0 });

        expect(statusCode).toBe(403);
        expect(body).toEqual({});
      });
    });

    describe('given the user updates a product without an accessToken', () => {
      it('should return statusCode 401', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`/api/products/${pearObjectId}`)
          .send({ ...pearDoc, _id: undefined, price: 5.0, discount: 2.0 });

        expect(statusCode).toBe(401);
        expect(body).toEqual({});
      });
    });

    describe('given the user sends a PUT request with an invalid product body', () => {});
  });

  describe('DELETE product', () => {
    describe('given the user deletes a product with a valid ID, token & admin role', () => {
      it('should return statusCode 200', async () => {
        const { statusCode, text } = await supertest(app)
          .delete(`/api/products/${bananaObjectId}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'admin',
            })}`,
          );

        expect(statusCode).toBe(200);
        expect(text).toEqual(`Product with ID ${bananaObjectId.toString()} deleted`);
      });
    });

    describe('given the user deletes a product with a user role', () => {
      it('should return statusCode 401', async () => {
        const { statusCode, text } = await supertest(app)
          .delete(`/api/products/${bananaObjectId}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          );

        expect(statusCode).toBe(401);
        expect(text).toEqual('Unauthorized');
      });
    });

    describe('given the user deletes a product without a valid ID', () => {
      it('should return statusCode 404', async () => {
        const { statusCode, text } = await supertest(app)
          .delete(`/api/products/${new ObjectId(123)}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'admin',
            })}`,
          );

        expect(statusCode).toBe(404);
        expect(text).toEqual('Not Found');
      });
    });

    describe('given the user deletes a product without a valid accessToken', () => {
      it('should return statusCode 403', async () => {
        const { statusCode, text } = await supertest(app)
          .delete(`/api/products/${bananaObjectId}`)
          .set('Authorization', 'Bearer 12345');

        expect(statusCode).toBe(403);
        expect(text).toEqual('Forbidden');
      });
    });

    describe('given the user deletes a product without an accessToken', () => {
      it('should return statusCode 401', async () => {
        const { statusCode, text } = await supertest(app).delete(`/api/products/${bananaObjectId}`);

        expect(statusCode).toBe(401);
        expect(text).toEqual('Unauthorized');
      });
    });
  });
});
