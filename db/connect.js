const mongoose = require('mongoose');

const connectDB = () => {
  return mongoose.connect('mongodb://localhost:27017/medimeal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
};

module.exports = connectDB;