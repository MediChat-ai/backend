const express = require('express');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./connect'); // connect.js 파일
const Account = require('./account'); // account.js 파일
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver').Strategy;

const app = express();

// 데이터베이스 연결
connectDB();

// 세션 설정
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// 구글
passport.use(new GoogleStrategy({
  clientID: '650684805513-4dpfekfa5b7vcof3f45a12vf51bpo9pm.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: '/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  const user = await Account.findOrCreate(profile);
  return done(null, user);
}));

// 네이버
passport.use(new NaverStrategy({
  clientID: 'YOUR_NAVER_CLIENT_ID',
  clientSecret: 'YOUR_NAVER_CLIENT_SECRET',
  callbackURL: '/auth/naver/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const user = await Account.findOrCreate(profile);
  return done(null, user);
}));

// OAuth 엔드포인트 설정
// 구글
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
});

// 네이버
app.get('/auth/naver', passport.authenticate('naver'));

app.get('/auth/naver/callback', 
  passport.authenticate('naver', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
});


// 프로필 라우트
app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.redirect('/');
  }
});

// 서버 시작
app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});
