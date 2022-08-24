import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import { generateAccessToken } from '../routes/auth';

import createServer from '../server';
import { collections, connectToDatabase } from '../services/database.service';
import { BadRequest } from '../utils/httpError';

describe('users', () => {
  const app = createServer();

  const userInput = {
    firstName: 'Lorenz',
    lastName: 'Reweghs',
    email: 'lorenz.reweghs@euri.com',
    password: 'Znerol',
    role: 'user',
  };

  let insertedIdJoe: ObjectId | undefined;

  beforeAll(async () => {
    await connectToDatabase().connect();
    try {
      await collections.users?.deleteMany({});
      await collections.tokens?.deleteMany({});

      bcrypt.hash('Kcarab', 10, async (err, hash) => {
        await collections.users?.insertOne({
          firstName: 'Barack',
          lastName: 'Obama',
          email: 'barack.obama@euri.com',
          password: hash,
          role: 'user',
        });
      });

      bcrypt.hash('Eoj', 10, async (err, hash) => {
        const result = await collections.users?.insertOne({
          firstName: 'Joe',
          lastName: 'Biden',
          email: 'joe.biden@euri.com',
          password: hash,
          role: 'admin',
        });
        insertedIdJoe = result?.insertedId;
      });
    } catch (err) {
      console.log(err);
    }
  });

  afterAll(async () => {
    await connectToDatabase().disconnect();
  });

  describe('user registration', () => {
    describe('given the user signs up with a username and password', () => {
      it('should return statusCode 201 and the user without the password', async () => {
        const { statusCode, body } = await supertest(app).post('/api/users').send(userInput);

        const { password, ...userOutput } = userInput;
        expect(statusCode).toBe(201);
        expect(body).toEqual({
          id: expect.any(String),
          ...userOutput,
        });

        const userDoc = await collections.users?.findOne({ _id: new ObjectId(body.id) });
        expect(userDoc).toBeDefined();
        expect(userDoc).toEqual({
          _id: new ObjectId(body.id),
          ...userInput,
          password: expect.any(String),
        });
      });
    });

    describe('given the user sends a PUT request with a valid ID & user', () => {
      it('should return statusCode 200 and the updated user', async () => {
        const input = {
          firstName: 'Joe',
          lastName: 'Biden',
          email: 'biden.joe@euri.com',
          password: 'Nedib',
          role: 'user',
        };

        const { statusCode, body } = await supertest(app)
          .put(`/api/users/${insertedIdJoe}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              password: 'Znerol',
            })}`,
          )
          .send(input);

        expect(statusCode).toBe(200);
        expect(body).toEqual({
          id: insertedIdJoe?.toString(),
          ...input,
          password: undefined,
        });
      });
    });
  });

  describe('given the user sends a PUT request with an invalid ID', () => {
    it('should return statusCode 404', async () => {
      const { statusCode } = await supertest(app).put('/api/users/123');

      expect(statusCode).toBe(401);
    });
  });

  describe('given the user sends a PUT request with an invalid user body', () => {
    test.skip('no firstName', async () => {
      async function putRequest() {
        await supertest(app)
          .put(`/api/users/${insertedIdJoe}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              password: 'Znerol',
            })}`,
          )
          .send({
            lastName: 'Obama',
            email: 'obama.barack@euri.com',
            password: 'Amabo',
            role: 'admin',
          });
      }

      // expect(() => guardAgainstInvalidUser({})).toThrowError(BadRequest);
      await expect(putRequest()).rejects.toThrowError(BadRequest);
    });

    test.skip('no lastName', async () => {
      async function putRequest() {
        await supertest(app)
          .put(`/api/users/${insertedIdJoe}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              password: 'Znerol',
            })}`,
          )
          .send({
            firstName: 'Barack',
            email: 'obama.barack@euri.com',
            password: 'Amabo',
            role: 'admin',
          });
      }
      await expect(putRequest()).rejects.toThrowError(BadRequest);
    });

    test.skip('no email', async () => {
      async function putRequest() {
        await supertest(app)
          .put(`/api/users/${insertedIdJoe}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              password: 'Znerol',
            })}`,
          )
          .send({
            firstName: 'Barack',
            lastName: 'Obama',
            password: 'Amabo',
            role: 'admin',
          });
      }
      await expect(putRequest()).rejects.toThrowError(BadRequest);
    });

    test.skip('no password', async () => {
      async function putRequest() {
        await supertest(app)
          .put(`/api/users/${insertedIdJoe}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              password: 'Znerol',
            })}`,
          )
          .send({
            firstName: 'Barack',
            lastName: 'Obama',
            email: 'obama.barack@euri.com',
            role: 'admin',
          });
      }
      await expect(putRequest()).rejects.toThrowError(BadRequest);
    });

    test.skip('no role', async () => {
      async function putRequest() {
        await supertest(app)
          .put(`/api/users/${insertedIdJoe}`)
          .set(
            'Authorization',
            `Bearer ${generateAccessToken({
              email: 'lorenz.reweghs@euri.com',
              password: 'Znerol',
            })}`,
          )
          .send({
            firstName: 'Barack',
            lastName: 'Obama',
            email: 'obama.barack@euri.com',
            password: 'Amabo',
          });
      }
      await expect(putRequest()).rejects.toThrowError(BadRequest);
    });
  });

  describe('given the username and password are valid', () => {
    it('should return an accessToken and refreshToken and save the refreshToken', async () => {
      const { statusCode, body } = await supertest(app).post('/api/login').send({
        email: userInput.email,
        password: userInput.password,
      });

      expect(statusCode).toBe(200);
      expect(body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      const { refreshToken } = body;
      const token = await collections.tokens?.findOne({ refreshToken });
      expect(token).toBeDefined();
      expect(token).toEqual({
        _id: expect.any(ObjectId),
        refreshToken,
        user_id: expect.any(ObjectId),
      });
    });
  });

  describe('given the email and password do not match', () => {
    it('should return statusCode 403', async () => {
      const { statusCode, body } = await supertest(app).post('/api/login').send({
        email: userInput.email,
        password: 'abc',
      });

      expect(statusCode).toBe(403);
      expect(body).toEqual({});
    });
  });

  describe('given the accessToken is expired but the refreshToken is valid', () => {
    it('should return a new accessToken', async () => {
      const result = await supertest(app).post('/api/login').send({
        email: userInput.email,
        password: userInput.password,
      });
      const { refreshToken } = result.body;

      const { statusCode, body } = await supertest(app).post('/api/token').send({ refreshToken });

      expect(statusCode).toBe(200);
      expect(body).toEqual({
        accessToken: expect.any(String),
      });
    });
  });

  describe('given the accessToken is expired and the refreshToken is not provided', () => {
    it('should return statusCode 401', async () => {
      const { statusCode, body } = await supertest(app).post('/api/token');

      expect(statusCode).toBe(400);
      expect(body).toEqual({});
    });
  });

  describe('given the accessToken is expired and the refreshToken is not valid', () => {
    it('should return statusCode 403', async () => {
      const { statusCode, body } = await supertest(app)
        .post('/api/token')
        .send({ refreshToken: 'avbsou47nbcijs35cnao' });

      expect(statusCode).toBe(403);
      expect(body).toEqual({});
    });
  });

  describe('given the user logs out with a refreshToken', () => {
    it('should return statusCode 204 and remove the refreshToken', async () => {
      const result = await supertest(app).post('/api/login').send({
        email: 'barack.obama@euri.com',
        password: 'Kcarab',
      });
      expect(result.statusCode).toBe(200);

      const email = 'barack.obama@euri.com';

      const { statusCode } = await supertest(app).delete('/api/logout').send({ email });

      expect(statusCode).toBe(204);

      const token = await collections.tokens?.findOne({ email });
      expect(token).toBeNull();
    });
  });

  describe('given the user logs out without a refreshToken', () => {
    it('should return statusCode 400', async () => {
      const { statusCode } = await supertest(app).delete('/api/logout');

      expect(statusCode).toBe(400);
    });
  });

  describe('given the user resets his password with his email', () => {
    it('should reset the password to a default value', async () => {
      const email = 'barack.obama@euri.com';

      const { statusCode } = await supertest(app).post('/api/users/resetPassword').send({
        email,
      });

      expect(statusCode).toBe(204);

      const user = await collections.users?.findOne({ email });
      expect(user).toEqual({
        _id: expect.any(ObjectId),
        firstName: 'Barack',
        lastName: 'Obama',
        email,
        password: expect.any(String),
        role: 'user',
      });
    });
  });

  describe('given the user resets his password with an unexisting email', () => {
    it('should return statusCode 404', async () => {
      const email = 'jonas.verbeeck@euri.com';

      const { statusCode } = await supertest(app).post('/api/users/resetPassword').send({
        email,
      });

      expect(statusCode).toBe(404);
    });
  });

  describe('given the user resets his password without an email', () => {
    it('should return statusCode 404', async () => {
      const { statusCode } = await supertest(app).post('/api/users/resetPassword');

      expect(statusCode).toBe(400);
    });
  });
});
