const express = require('express');
const app = express();
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const connectDB = require('./db/connect');

const port = 3000;
app.use(express.json()); // JSON 파싱 미들웨어
app.use('/', indexRouter);
app.use('/users', usersRouter);
connectDB()

app.listen(port, function () {
	console.log('Example app listening on port: ' + port);
});