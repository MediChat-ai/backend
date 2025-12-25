import crypto from 'crypto';

export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const validateUserId = (userId: string): boolean => {
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(userId);
};
