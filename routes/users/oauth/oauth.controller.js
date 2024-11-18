const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const Account = require('../../../db/account');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const OAUTH_PW = process.env.OAUTH_PW;

const client = new OAuth2Client(CLIENT_ID);

exports.google = async (req, res) => {
  const { accessToken: idToken } = req.body;

  try {
    // 1. Google ID 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await Account.findOne({ user_id: email });

    if (!user) {
      // 새 사용자 생성
      user = new Account({
        user_id: email,
        user_name: name,
        password: OAUTH_PW,
        auth_provider: 'google',
      });

      await user.save();
    }

    const jwtToken = jwt.sign(
      { user_id: user.user_id, user_name: user.user_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.error('Google ID 토큰 검증 실패:', error);
    return res.status(401).json({ error: '유효하지 않은 Google ID 토큰입니다.' });
  }
};
