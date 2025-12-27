import mongoose, { Document, Schema, Types } from 'mongoose';

// Board Interface & Schema
export interface IBoard extends Document {
  name: string;
  description: string;
  cover_url: string;
  created_at: Date;
}

const boardSchema = new Schema<IBoard>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  cover_url: { type: String },
  created_at: { type: Date, default: Date.now },
});

export const Board = mongoose.model<IBoard>('Board', boardSchema);

// Comment Interface & Schema
export interface IComment extends Document {
  post_id: Types.ObjectId;
  author_id: string;
  author_name: string;
  content: string;
  created_at: Date;
}

const commentSchema = new Schema<IComment>({
  post_id: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author_id: { type: String, required: true },
  author_name: { type: String, required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export const Comment = mongoose.model<IComment>('Comment', commentSchema);

// Post Interface & Schema
export interface IPost extends Document {
  author_id: string;
  author_name: string;
  board_id: string;
  post_title: string;
  post_content: string;
  view_count: number;
  created_at: Date;
}

const postSchema = new Schema<IPost>({
  author_id: { type: String, required: true },
  author_name: { type: String, required: true },
  board_id: { type: String, required: true },
  post_title: { type: String, required: true },
  post_content: { type: String, required: true },
  view_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

export const Post = mongoose.model<IPost>('Post', postSchema);

export const ensureDefaultBoards = async (): Promise<void> => {
  try {
    const count = await Board.countDocuments();
    if (count === 0) {
      const defaultBoards = [
        { name: '자유게시판', description: '자유롭게 소통하는 게시판입니다.', cover_url: '' },
        { name: '질문게시판', description: '질문과 답변을 위한 게시판입니다.', cover_url: '' },
      ];
      await Board.insertMany(defaultBoards.map(b => ({ ...b, created_at: new Date() })));
      console.log('Default boards created');
    }
  } catch (err) {
    console.error('ensureDefaultBoards error:', err);
  }
};
