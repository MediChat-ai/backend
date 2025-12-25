import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';
import { AuthRequest } from '../types';

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }

  req.user = payload;
  next();
};

export const extractTokenFromBody = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: '토큰이 필요합니다.' });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }

  (req as AuthRequest).user = payload;
  next();
};
