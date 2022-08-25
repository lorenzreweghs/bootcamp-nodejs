import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import Basket from '../models/basket';
import { generateAccessToken } from '../routes/auth';
import createServer from '../server';
import { collections, connectToDatabase } from '../services/database.service';

describe('baskets', () => {
  const app = createServer();

  const basketInputId = new ObjectId();
  const basketOneId = new ObjectId();
  const basketTwoId = new ObjectId();
  const basketThreeId = new ObjectId();

  const basketInput = {
    _id: basketInputId,
    items: [
      {
        product: {
          name: 'orange',
          price: 1.5,
          discount: 0.2,
        },
        quantity: 8,
      },
      {
        product: {
          name: 'apple',
          price: 1.0,
          discount: 0.1,
        },
        quantity: 6,
      },
    ],
    discountCode: 'ABCDF',
    expireTime: '2022-08-25T08:11:25.017Z',
  };

  const basketOneDoc = {
    _id: basketOneId,
    items: [
      {
        product: {
          name: 'banana',
          price: 2.0,
          discount: 0.4,
        },
        quantity: 16,
      },
      {
        product: {
          name: 'apple',
          price: 1.0,
          discount: 0.1,
        },
        quantity: 5,
      },
    ],
    discountCode: 'SYWNI',
    expireTime: '2022-08-25T08:11:25.017Z',
  };

  const basketTwoDoc = {
    _id: basketTwoId,
    items: [
      {
        product: {
          name: 'orange',
          price: 1.5,
          discount: 0.2,
        },
        quantity: 7,
      },
      {
        product: {
          name: 'pear',
          price: 1.4,
          discount: 0.2,
        },
        quantity: 3,
      },
    ],
    discountCode: 'QOICY',
    expireTime: '2022-08-25T08:11:25.017Z',
  };

  const basketThreeDoc = {
    _id: basketThreeId,
    items: [
      {
        product: {
          name: 'pineapple',
          price: 2.5,
          discount: 0,
        },
        quantity: 2,
      },
      {
        product: {
          name: 'apple',
          price: 1.0,
          discount: 0.1,
        },
        quantity: 8,
      },
    ],
    discountCode: 'PVQUX',
    expireTime: '2022-08-25T08:11:25.017Z',
  };

  beforeAll(async () => {
    await connectToDatabase().connect();

    try {
      await collections.baskets?.deleteMany({});

      await collections.baskets?.insertMany([basketOneDoc, basketTwoDoc, basketThreeDoc]);
    } catch (err) {
      console.log(err);
    }
  });

  afterAll(async () => {
    await connectToDatabase().disconnect();
  });

  describe('GET basket', () => {
    describe('given the user gets a basket with an existing ID', () => {
      it('should return statusCode 200 and the requested basket', async () => {
        const { statusCode, body } = await supertest(app).get(`/api/baskets/${basketOneId}`);

        expect(statusCode).toBe(200);
        expect(body).toEqual({ ...basketOneDoc, _id: basketOneId.toString() });
      });
    });

    describe('given the user gets a basket with an unexisting ID', () => {
      it('should return statusCode 404', async () => {
        const { statusCode, body } = await supertest(app).get(`/api/baskets/${new ObjectId(123)}`);

        expect(statusCode).toBe(404);
        expect(body).toEqual({});
      });
    });

    describe('given the user gets a basket with an invalid ID', () => {
      it('should return statusCode 500', async () => {
        const { statusCode, body } = await supertest(app).get('/api/baskets/abc');

        expect(statusCode).toBe(500);
        expect(body).toEqual({});
      });
    });
  });

  describe('GET baskets', () => {
    describe('given the user gets all baskets with a valid token & role admin', () => {
      it('should return statusCode 200 and an array of baskets', async () => {
        const { statusCode, body } = await supertest(app)
          .get('/api/baskets')
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'admin',
            })}`,
          );

        expect(statusCode).toBe(200);
        expect(body).toEqual([
          { ...basketOneDoc, _id: basketOneId.toString() },
          { ...basketTwoDoc, _id: basketTwoId.toString() },
          { ...basketThreeDoc, _id: basketThreeId.toString() },
        ]);
      });
    });
    describe('given the user gets all baskets with a valid token but without role admin', () => {
      it('should return statusCode 200 and an array of baskets', async () => {
        const { statusCode, body } = await supertest(app)
          .get('/api/baskets')
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          );

        expect(statusCode).toBe(401);
        expect(body).toEqual({});
      });
    });
    describe('given the user gets all baskets without a valid token', () => {
      it('should return statusCode 200 and an array of baskets', async () => {
        const { statusCode, body } = await supertest(app).get('/api/baskets');

        expect(statusCode).toBe(401);
        expect(body).toEqual({});
      });
    });
  });

  describe('POST basket', () => {
    describe('given the user adds a basket with a valid body & token', () => {
      it('should return statusCode 201 and the added basket', async () => {
        const { statusCode, body } = await supertest(app)
          .post('/api/baskets')
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          )
          .send(basketInput);

        expect(statusCode).toBe(201);
        expect(body).toEqual({ ...basketInput, _id: basketInputId.toString(), id: basketInputId.toString() });

        const orangeDoc = await collections.baskets?.findOne<Basket>({ _id: basketInputId.toString() });
        expect(orangeDoc).toBeDefined();
        expect(orangeDoc).toEqual({ ...basketInput, _id: basketInputId.toString() });
      });
    });

    describe('given the user adds a basket without a valid accessToken', () => {
      it('should return statusCode 403', async () => {
        const { statusCode, body } = await supertest(app)
          .post('/api/baskets')
          .set('Authorization', 'Bearer 12345')
          .send(basketInput);

        expect(statusCode).toBe(403);
        expect(body).toEqual({});
      });
    });

    describe('given the user adds a basket without an accessToken', () => {
      it('should return statusCode 401', async () => {
        const { statusCode, body } = await supertest(app).post('/api/baskets').send(basketInput);

        expect(statusCode).toBe(401);
        expect(body).toEqual({});
      });
    });

    describe('given the user sends a POST request with an invalid basket body', () => {});
  });

  describe('PUT basket', () => {
    describe('given the user updates a basket with a valid ID, body & token', () => {
      it('should return statusCode 200 and the updated basket', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`/api/baskets/${basketTwoId}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          )
          .send({
            ...basketTwoDoc,
            _id: undefined,
            items: [
              {
                product: {
                  name: 'peach',
                  price: 1.7,
                  discount: 0.3,
                },
                quantity: 4,
              },
              {
                product: {
                  name: 'pear',
                  price: 1.4,
                  discount: 0.2,
                },
                quantity: 12,
              },
            ],
          });

        expect(statusCode).toBe(200);
        expect(body).toEqual({
          ...basketTwoDoc,
          items: [
            {
              product: {
                name: 'peach',
                price: 1.7,
                discount: 0.3,
              },
              quantity: 4,
            },
            {
              product: {
                name: 'pear',
                price: 1.4,
                discount: 0.2,
              },
              quantity: 12,
            },
          ],
          _id: undefined,
          id: basketTwoId.toString(),
        });
      });
    });

    describe('given the user updates a basket without a valid ID', () => {
      it('should return statusCode 404', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`/api/baskets/${new ObjectId(123)}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          )
          .send({ ...basketTwoDoc, _id: undefined, discountCode: 'ENDJN' });

        expect(statusCode).toBe(404);
        expect(body).toEqual({});
      });
    });

    describe('given the user updates a basket without a valid accessToken', () => {
      it('should return statusCode 403', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`/api/baskets/${basketTwoId}`)
          .set('Authorization', 'Bearer 12345')
          .send({ ...basketTwoDoc, _id: undefined, discountCode: 'JDNWU' });

        expect(statusCode).toBe(403);
        expect(body).toEqual({});
      });
    });

    describe('given the user updates a basket without an accessToken', () => {
      it('should return statusCode 401', async () => {
        const { statusCode, body } = await supertest(app)
          .put(`/api/baskets/${basketTwoId}`)
          .send({ ...basketTwoDoc, _id: undefined, discountCode: 'DIUEN' });

        expect(statusCode).toBe(401);
        expect(body).toEqual({});
      });
    });

    describe('given the user sends a PUT request with an invalid basket body', () => {});
  });

  describe('DELETE basket', () => {
    describe('given the user deletes a basket with a valid ID & token', () => {
      it('should return statusCode 200', async () => {
        const { statusCode, text } = await supertest(app)
          .delete(`/api/baskets/${basketThreeId}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          );

        expect(statusCode).toBe(200);
        expect(text).toEqual(`Basket with ID ${basketThreeId.toString()} deleted`);
      });
    });

    describe('given the user deletes a basket without a valid ID', () => {
      it('should return statusCode 404', async () => {
        const { statusCode, text } = await supertest(app)
          .delete(`/api/baskets/${new ObjectId(123)}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              role: 'user',
            })}`,
          );

        expect(statusCode).toBe(404);
        expect(text).toEqual('Not Found');
      });
    });

    describe('given the user deletes a basket without a valid accessToken', () => {
      it('should return statusCode 403', async () => {
        const { statusCode, text } = await supertest(app)
          .delete(`/api/baskets/${basketThreeId}`)
          .set('Authorization', 'Bearer 12345');

        expect(statusCode).toBe(403);
        expect(text).toEqual('Forbidden');
      });
    });

    describe('given the user deletes a basket without an accessToken', () => {
      it('should return statusCode 401', async () => {
        const { statusCode, text } = await supertest(app).delete(`/api/baskets/${basketThreeId}`);

        expect(statusCode).toBe(401);
        expect(text).toEqual('Unauthorized');
      });
    });
  });
});
