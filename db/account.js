const mongoose = require('mongoose');

// Account 스키마 정의
const accountSchema = new mongoose.Schema({
  user_id: String,
  user_name: String,
  password: String,
  email: String,
  created_at: { type: Date, default: Date.now },
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
