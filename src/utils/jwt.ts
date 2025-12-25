import * as jose from 'jose';
import dotenv from 'dotenv';
import { JwtPayload } from '../types';

dotenv.config();

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

export const signToken = async (payload: JwtPayload): Promise<string> => {
  return await new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<JwtPayload | null> => {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
};
