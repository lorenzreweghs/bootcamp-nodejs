import { ObjectId } from 'mongodb';
import supertest from 'supertest';

import * as AuthHandlers from '../routes/auth';
import createServer from '../server';

describe('users', () => {
  const app = createServer();

  const user = {
    username: 'Lorenz',
    password: 'Znerol',
  };

  describe('user registration', () => {
    describe('given the user signs up with a username and password', () => {
      it('should return statusCode 201 and an object with the ID and username', async () => {
        const insertedId = new ObjectId();
        const createUserMock = jest.spyOn(AuthHandlers, 'registerHandler').mockImplementation((_req, res) => {
          const { username } = _req.body;
          res.status(201).json({
            id: insertedId,
            username,
          });
        });

        const { statusCode, body } = await supertest(app).post('/api/register').send(user);

        expect(statusCode).toBe(201);
        expect(createUserMock).toHaveBeenCalledTimes(1);
        expect(body).toEqual({
          id: `${insertedId}`,
          username: 'Lorenz',
        });
      });
    });

    describe('given the username and password are valid', () => {
      it('should return an accessToken and refreshToken and save the refreshToken', async () => {
        const { statusCode, body } = await supertest(app).post('/api/login').send(user);

        expect(statusCode).toBe(200);
        expect(body).toEqual({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });

        // check if refreshToken is saved
      });
    });

    describe('given the accessToken is expired but the refreshToken is valid', () => {
      it('should return a new accessToken', async () => {
        const result = await supertest(app).post('/api/login').send(user);
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

        expect(statusCode).toBe(401);
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
        const { statusCode } = await supertest(app)
          .delete('/api/logout')
          .send({ refreshToken: 'avbsou47nbcijs35cnao' });

        expect(statusCode).toBe(204);

        // check if refreshToken is removed
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
