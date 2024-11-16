const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 게시판 이름
  description: { type: String }, // 게시판 설명
  created_at: { type: Date, default: Date.now },
});

const Board = mongoose.model('Board', boardSchema);

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // 게시글 참조
  authorId: { type: String, required: true }, // 작성자 ID
  content: { type: String, required: true }, // 댓글 내용
  created_at: { type: Date, default: Date.now }, // 댓글 작성 시간
});

const Comment = mongoose.model('Comment', commentSchema);

const postSchema = new mongoose.Schema({
  authorId: { type: String, required: true },
  boardName: { type: String, required: true },
  postTitle: { type: String, required: true },
  postContent: { type: String, required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // 댓글 참조
  created_at: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);
module.exports = { Board, Comment, Post };
