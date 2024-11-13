const express = require('express');
const app = express();
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const connectDB = require('./db/connect');

const port = 3001;
app.use(express.json());
app.use('/', indexRouter);
app.use('/users', usersRouter);
connectDB()

app.listen(port, function () {
	console.log('Example app listening on port: ' + port);
});