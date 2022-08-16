/* eslint-disable consistent-return */
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface UserRequest extends Request {
  user?: string | JwtPayload;
}

export const authenticateToken = (_req: Request, res: Response, next: NextFunction) => {
  const { authorization } = _req.headers;
  const token = authorization && authorization.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
    if (err) return res.sendStatus(403);

    const request = _req as UserRequest;
    request.user = user;
    next();
  });
};
