// backend/routes/users/index.js

const express = require('express');
const router = express.Router();
const accountController = require('./users.controller');

// 사용자 관련 라우트
router.post('/login', accountController.login);
router.post('/register', accountController.register);
router.post('/auth', accountController.auth);

// Google OAuth 라우트
router.get('/auth/google', accountController.googleAuth); // Google 로그인 요청
router.get('/auth/google/callback', accountController.googleAuthCallback); // Google 로그인 콜백

module.exports = router;
