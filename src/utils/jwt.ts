import fs from 'fs';
import path from 'path';
import * as jose from 'jose';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import { JwtPayload } from '../types';

dotenv.config();

const ensureJwtSecretValue = (): string => {
  const current = process.env.JWT_SECRET;
  if (current && current.trim().length > 0) {
    return current;
  }

  const generated = randomBytes(64).toString('hex');
  process.env.JWT_SECRET = generated;

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
      if (/^JWT_SECRET=.*$/m.test(envContent)) {
        envContent = envContent.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${generated}`);
      } else {
        if (envContent.length > 0 && !envContent.endsWith('\n')) {
          envContent += '\n';
        }
        envContent += `JWT_SECRET=${generated}\n`;
      }
    } else {
      envContent = `JWT_SECRET=${generated}\n`;
    }

    fs.writeFileSync(envPath, envContent);
  } catch (error) {
    console.error('Failed to persist JWT_SECRET to .env file:', error);
  }

  return generated;
};

const JWT_SECRET = new TextEncoder().encode(ensureJwtSecretValue());

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
