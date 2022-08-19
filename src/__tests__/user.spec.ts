import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import supertest from 'supertest';

import createServer from '../server';
import { collections, connectToDatabase } from '../services/database.service';

describe('users', () => {
  const app = createServer();

  const userInput = {
    firstName: 'Lorenz',
    lastName: 'Reweghs',
    email: 'lorenz.reweghs@euri.com',
    password: 'Znerol',
    role: 'user',
  };

  beforeAll(async () => {
    await connectToDatabase().connect();
    try {
      await collections.users?.drop();
      await collections.tokens?.drop();

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
        await collections.users?.insertOne({
          firstName: 'Joe',
          lastName: 'Biden',
          email: 'joe.biden@euri.com',
          password: hash,
          role: 'admin',
        });
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
        const { statusCode, body } = await supertest(app).post('/api/token').send({});

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
        const { refreshToken } = result.body;
        expect(result.statusCode).toBe(200);

        const { statusCode } = await supertest(app).delete('/api/logout').send({ refreshToken });

        expect(statusCode).toBe(204);

        const token = await collections.tokens?.findOne({ refreshToken });
        expect(token).toBeNull();
      });
    });

    describe('given the user logs out without a refreshToken', () => {
      it('should return statusCode 401', async () => {
        const { statusCode } = await supertest(app).delete('/api/logout').send({});

        expect(statusCode).toBe(401);
      });
    });
  });
});
