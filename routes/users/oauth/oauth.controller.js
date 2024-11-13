//google, naver, github
require('dotenv').config();
const axios = require('axios');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = 'http://localhost:3001/users/oauth/google/redirect';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

exports.google = (req, res) => {
  let url = 'https://accounts.google.com/o/oauth2/v2/auth';
  url += `?client_id=${GOOGLE_CLIENT_ID}`;
  url += `&redirect_uri=${GOOGLE_REDIRECT_URI}`;
  url += '&response_type=code';
  url += '&scope=email%20profile';
  return res.status(200).json({ message: url });
};

exports.google_redirect = async (req, res) => {
  const { code } = req.query;
  console.log(`code: ${code}`);

  const resp = await axios.post(GOOGLE_TOKEN_URL, {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${resp.data.access_token}`,
    },
  });
  return res.status(200).json({ message: resp2.data });
};