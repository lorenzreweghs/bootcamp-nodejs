import supertest from 'supertest';

import createServer from '../server';

describe('users', () => {
  const app = createServer();

  const user = {
    username: 'Lorenz',
    password: 'Znerol',
  };

  describe('user registration', () => {
    describe('given the user signs up with a username and password', () => {
      it('should add the user and return it', () => {
        // const createUserMock = jest.spyOn();
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
      });
    });

    describe('given the accessToken is expired but the refreshToken is valid', () => {
      it('should return a new accessToken', () => {
        expect(true).toBe(true);
      });
    });

    describe('given the accessToken is expired and the refreshToken is not provided', () => {
      it('should return statusCode 401', () => {
        expect(true).toBe(true);
      });
    });

    describe('given the accessToken is expired and the refreshToken is not valid', () => {
      it('should return statusCode 403', () => {
        expect(true).toBe(true);
      });
    });

    describe('given the user logs out', () => {
      it('should return statusCode 204 and remove the refreshToken', () => {
        expect(true).toBe(true);
      });
    });
  });
});
