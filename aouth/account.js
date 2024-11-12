const mongoose = require('mongoose');

//스키마 정의
const accountSchema = new mongoose.Schema({
  user_id: String,
  user_name: String,
  password: String,
  email: String,
  created_at: { type: Date, default: Date.now },
});

// 사용자 정보 데이터베이스에 저장
accountSchema.statics.findOrCreate = async function(profile) {
  const account = await this.findOne({ user_id: profile.id });
  if (account) {
    return account;
  } else {
    const newAccount = new this({
      user_id: profile.id,
      user_name: profile.displayName,
      email: profile.emails[0].value,
    });
    return await newAccount.save();
  }
};

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
