const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const connectDB = require('./db/connect');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: crypto.randomBytes(16).toString('base64'),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, sameSite: 'none' }
}));
app.use(passport.initialize());
app.use(passport.session());

connectDB()
app.use('/', indexRouter);
app.use('/users', usersRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
