import { Request, Response } from 'express';
import { Account } from '../../db';
import { signToken, hashPassword, validateUserId, verifyToken } from '../../utils';

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { user_id, pw } = req.body;

    if (!user_id || !pw) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const account = await Account.findOne({
      user_id,
      password: hashPassword(pw),
    });

    if (!account) {
      return res.status(401).json({ error: '인증 실패: 잘못된 ID 또는 비밀번호입니다.' });
    }

    if (account.auth_provider !== 'local') {
      return res.status(400).json({ error: '잘못된 접근입니다.' });
    }

    const token = await signToken({
      user_id: account.user_id,
      user_name: account.user_name,
      auth_provider: account.auth_provider,
    });

    return res.status(200).json({ message: '로그인 성공', token });
  } catch (err) {
    return res.status(500).json({ error: '로그인 과정에서 오류가 발생했습니다.', details: err });
  }
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { user_id, user_name, pw, auth_provider } = req.body;

    if (!user_id || !user_name || !pw || !auth_provider) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    if (!validateUserId(user_id) && auth_provider === 'local') {
      return res.status(400).json({ error: '아이디는 영문자와 숫자만 가능합니다.' });
    }

    if (auth_provider !== 'local') {
      return res.status(400).json({ error: '잘못된 접근입니다.' });
    }

    const existingAccount = await Account.findOne({ user_id });
    if (existingAccount) {
      return res.status(401).json({ error: '중복된 ID 입니다.' });
    }

    await new Account({
      user_id,
      user_name,
      created_at: new Date(),
      auth_provider,
      password: hashPassword(pw),
    }).save();

    const token = await signToken({ user_id, user_name, auth_provider });
    return res.status(200).json({ message: '계정이 생성되었습니다.', token });
  } catch (err) {
    return res.status(500).json({ error: '계정 생성 과정에서 오류가 발생했습니다.', details: err });
  }
};

export const auth = async (req: Request, res: Response): Promise<Response> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const account = await Account.findOne({ user_id: decoded.user_id });
    if (!account) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    return res.status(200).json({ message: '인증 성공' });
  } catch (err) {
    return res.status(500).json({ error: '사용자 조회 과정에서 오류가 발생했습니다.', details: err });
  }
};
