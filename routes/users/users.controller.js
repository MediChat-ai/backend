// backend/routes/users/users.controller.js

require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Account = require('../../db/account');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Passport 설정
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/users/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    Account.findOne({ user_id: profile.id })
        .then(existingAccount => {
            if (existingAccount) {
                return done(null, existingAccount);
            } else {
                // 새 계정 생성
                const newAccount = new Account({
                    user_id: profile.id,
                    user_name: profile.displayName,
                    created_at: new Date(),
                    // 비밀번호는 필요하지 않음
                    password: null
                });
                return newAccount.save().then(account => done(null, account));
            }
        })
        .catch(err => done(err, null));
}));

exports.login = (req, res) => {
    const { user_id, pw } = req.body;
    if (!user_id || !pw)
        return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    Account.findOne({ user_id, password: crypto.createHash('sha256').update(pw).digest('hex') })
        .then(account => {
            if (!account)
                return res.status(401).json({ error: '인증 실패: 잘못된 ID 또는 비밀번호입니다.' });
            const token = jwt.sign({ user_id: account.user_id, user_name: account.user_name }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return res.status(200).json({ message: '로그인 성공', token, account });
        })
        .catch(err => {
            if (!res.headersSent)
                return res.status(500).json({ error: '로그인 과정에서 오류가 발생했습니다.', details: err });
        });
}

exports.register = (req, res) => {
    const { user_id, user_name, pw } = req.body;
    if (!user_id || !user_name || !pw)
        return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    Account.findOne({ user_id })
        .then(existingAccount => {
            if (existingAccount)
                return res.status(400).json({ error: '중복된 ID 입니다.' });
            return new Account({
                user_id,
                user_name,
                created_at: new Date(),
                password: crypto.createHash('sha256').update(pw).digest('hex')
            }).save();
        })
        .then(savedAccount => res.status(201).json({ message: '계정이 생성되었습니다.', account: savedAccount }))
        .catch(err => {
            if (!res.headersSent)
                return res.status(500).json({ error: '계정 생성 과정에서 오류가 발생했습니다.', details: err });
        });
}

exports.auth = (req, res) => {
    const { token } = req.body;
    if (!token)
        return res.status(400).json({ error: '토큰이 누락되었습니다.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
            return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });
        Account.findOne({ user_id: decoded.user_id })
            .then(account => {
                if (!account)
                    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

                return res.status(200).json({ message: '인증 성공', account: account });
            })
            .catch(err => {
                if (!res.headersSent)
                    return res.status(500).json({ error: '사용자 조회 과정에서 오류가 발생했습니다.', details: err });
            });
    });
}

// Google OAuth 라우트
exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

// Google OAuth 콜백 라우트
exports.googleAuthCallback = (req, res) => {
    const token = jwt.sign({ user_id: req.user.user_id, user_name: req.user.user_name }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: 'Google 로그인 성공', token, account: req.user });
}
