import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { Account } from '../../db';
import { signToken, hashPassword } from '../../utils';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const OAUTH_PW = process.env.OAUTH_PW as string;
const client = new OAuth2Client(CLIENT_ID);

export const googleOAuth = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { accessToken: idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Google 인증 실패' });
    }

    const { email, name } = payload;
    let user = await Account.findOne({ user_id: email });

    if (!user) {
      user = new Account({
        user_id: email,
        user_name: name,
        password: hashPassword(OAUTH_PW),
        auth_provider: 'google',
      });
      await user.save();
    }

    const jwtToken = await signToken({
      user_id: user.user_id,
      user_name: user.user_name,
      auth_provider: user.auth_provider,
    });

    return res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.error('Google ID 토큰 검증 실패:', error);
    return res.status(401).json({ error: '유효하지 않은 Google ID 토큰입니다.' });
  }
};

export const naverOAuth = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { access_token } = req.body;

    const response = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userInfo = response.data;
    const { email, nickname } = userInfo.response;

    let user = await Account.findOne({ user_id: email });

    if (!user) {
      user = new Account({
        user_id: email,
        user_name: nickname,
        password: hashPassword(OAUTH_PW),
        auth_provider: 'naver',
      });
      await user.save();
    }

    const jwtToken = await signToken({
      user_id: user.user_id,
      user_name: user.user_name,
      auth_provider: user.auth_provider,
    });

    return res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.error('네이버 인증 실패:', error);
    return res.status(500).json({ error: '네이버 인증에 실패했습니다.' });
  }
};
