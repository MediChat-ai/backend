import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ensureDefaultBoards } from './community';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected');
    await ensureDefaultBoards();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
