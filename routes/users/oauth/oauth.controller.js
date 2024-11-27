const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const Account = require('../../../db/account');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const OAUTH_PW = process.env.OAUTH_PW;

const client = new OAuth2Client(CLIENT_ID);

exports.google = async (req, res) => {
  const { accessToken: idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await Account.findOne({ user_id: email });

    if (!user) {
      user = new Account({
        user_id: email,
        user_name: name,
        password: crypto.createHash('sha256').update(OAUTH_PW).digest('hex'),
        auth_provider: 'google',
      });

      await user.save();
    }

    const jwtToken = jwt.sign(
      { user_id: user.user_id, user_name: user.user_name, auth_provider: user.auth_provider },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.error('Google ID 토큰 검증 실패:', error);
    return res.status(401).json({ error: '유효하지 않은 Google ID 토큰입니다.' });
  }
};

exports.naver = async (req, res) => {
  const { access_token } = req.body;

  console.log(access_token);

  try {
    const response = await axios.get("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userInfo = response.data;

    let user = await Account.findOne({ user_id: userInfo.response.email });

    if (!user) {
      user = new Account({
        user_id: userInfo.response.email,
        user_name: userInfo.response.nickname,
        password: crypto.createHash('sha256').update(OAUTH_PW).digest('hex'),
        auth_provider: 'naver',
      });

      await user.save();
    }

    const jwtToken = jwt.sign(
      { user_id: user.user_id, user_name: user.user_name, auth_provider: user.auth_provider },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.error("Error fetching user info:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch user info" });
  }
};