// backend/app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const userRoutes = require('./routes/users'); // 사용자 관련 라우터

const app = express();

app.use(bodyParser.json());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/medimeal', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
