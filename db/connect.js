// backend/connect.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI); // 옵션 없음
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // 연결 실패 시 프로세스 종료
    }
};

module.exports = connectDB;
