import mongoose, { Document, Schema } from 'mongoose';

export interface IAccount extends Document {
  user_id: string;
  user_name: string;
  password: string;
  auth_provider: string;
  created_at: Date;
}

const accountSchema = new Schema<IAccount>({
  user_id: { type: String, required: true, unique: true },
  user_name: { type: String, required: true },
  password: { type: String, required: true },
  auth_provider: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export const Account = mongoose.model<IAccount>('Account', accountSchema);
