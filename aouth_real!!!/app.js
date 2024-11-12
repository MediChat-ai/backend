const express = require('express');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./connect'); // MongoDB 연결
const Account = require('./account'); // 사용자 모델
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver').Strategy;
const path = require('path');
require('dotenv').config(); // 환경 변수 설정

const app = express();

// 데이터베이스 연결
connectDB();

// 세션 설정
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// Passport 설정
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google OAuth 전략 설정
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  const user = await Account.findOrCreate(profile);
  return done(null, user);
}));

// Naver OAuth 전략 설정
passport.use(new NaverStrategy({
  clientID: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
  callbackURL: '/auth/naver/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const user = await Account.findOrCreate(profile);
  return done(null, user);
}));

// OAuth 엔드포인트 설정
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
});

app.get('/auth/naver', passport.authenticate('naver'));
app.get('/auth/naver/callback', 
  passport.authenticate('naver', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
});

// 프로필 라우트
app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
  } else {
    res.redirect('/');
  }
});

// 홈 페이지 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});
