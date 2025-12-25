import { Request, Response } from 'express';
import { Account } from '../../db';
import { signToken, verifyToken, hashPassword } from '../../utils';

export const changeUsername = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { new_username, token } = req.body;

    if (!new_username || !token) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const account = await Account.findOneAndUpdate(
      { user_id: decoded.user_id },
      { user_name: new_username },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const newToken = await signToken({
      user_id: decoded.user_id,
      user_name: new_username,
      auth_provider: decoded.auth_provider,
    });

    return res.status(200).json({
      message: '사용자 이름이 성공적으로 변경되었습니다.',
      token: newToken,
    });
  } catch (err) {
    return res.status(500).json({
      error: '사용자 이름 변경 과정에서 오류가 발생했습니다.',
      details: err,
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token, password, new_password } = req.body;

    if (!token || !password || !new_password) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const currentHashedPassword = hashPassword(password);
    const account = await Account.findOne({
      user_id: decoded.user_id,
      password: currentHashedPassword,
    });

    if (!account) {
      return res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
    }

    account.password = hashPassword(new_password);
    await account.save();

    return res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err) {
    return res.status(500).json({
      error: '비밀번호 변경 과정에서 오류가 발생했습니다.',
      details: err,
    });
  }
};
