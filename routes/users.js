const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const app = express();
const router = express.Router();

mongoose.connect('mongodb://localhost:27017/medimeal', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Account 스키마 정의
const accountSchema = new mongoose.Schema({
    user_id: String,
    user_name: String,
    password: String,
    email: String,
    created_at: { type: Date, default: Date.now },
});

const Account = mongoose.model('Account', accountSchema);

router.get('/login', (req, res) => {

});

router.post('/register', (req, res) => {
    const { user_id, user_name, pw } = req.body;
    if (!user_id || !user_name || !pw)
        return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    // 중복된 user_id 확인
    Account.findOne({ user_id })
        .then(existingAccount => {
            if (existingAccount)
                return res.status(400).json({ error: '중복된 ID 입니다.' })
            return new Account({
                user_id,
                user_name,
                created_at: new Date(),
                password: crypto.createHash('sha256').update(pw).digest('hex')
            }).save();
        })
        .then(savedAccount => res.status(201).json({ message: '계정이 생성되었습니다.', account: savedAccount }))
        .catch(err => {
            if (!res.headersSent)
                return res.status(500).json({ error: '계정 생성 과정에서 오류가 발생했습니다.', details: err });
        });
});

module.exports = router;