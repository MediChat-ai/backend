const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Account = require('../../../db/account');

const validateUsername = username => {
  const regex = /^[가-힣a-zA-Z0-9]+$/;
  return regex.test(username);
}

exports.username = (req, res) => {
  const { new_username, token } = req.body;
  if (!new_username || !token)
    return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
  if (!validateUsername(new_username))
    return res.status(400).json({ error: '닉네임에 특수문자가 포함되면 안 됩니다.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });

    Account.findOneAndUpdate({ user_id: decoded.user_id }, { user_name: new_username }, { new: true })
      .then(account => {
        if (!account)
          return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

        return res.status(200).json({ message: '사용자 이름이 성공적으로 변경되었습니다.' });
      })
      .catch(err => {
        if (!res.headersSent)
          return res.status(500).json({ error: '사용자 이름 변경 과정에서 오류가 발생했습니다.', details: err });
      });
  });
}

exports.password = (req, res) => {
  const { token, password, new_password } = req.body;
  if (!token || !password || !new_password)
    return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });

    const currentHashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    Account.findOne({ user_id: decoded.user_id, password: currentHashedPassword })
      .then(account => {
        if (!account)
          return res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });

        const newHashedPassword = crypto.createHash('sha256').update(new_password).digest('hex');

        account.password = newHashedPassword;
        return account.save();
      })
      .then(() => {
        return res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
      })
      .catch(err => {
        if (!res.headersSent)
          return res.status(500).json({ error: '비밀번호 변경 과정에서 오류가 발생했습니다.', details: err });
      });
  });
}