import { Request, Response, NextFunction } from 'express';

export interface JwtPayload {
  user_id: string;
  user_name: string;
  auth_provider: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;
