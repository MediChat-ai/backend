import { Request, Response } from 'express';
import { Board, Post, Comment } from '../../db';
import { verifyToken } from '../../utils';
import { AuthRequest } from '../../types';

// Board Controllers
export const createBoard = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { board_name, description, token, cover_url } = req.body;

    if (!board_name || !description || !token || !cover_url) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const existingBoard = await Board.findOne({ name: board_name });
    if (existingBoard) {
      return res.status(400).json({ error: '이미 존재하는 게시판 이름입니다.' });
    }

    const savedBoard = await new Board({
      name: board_name,
      description,
      created_at: new Date(),
      cover_url,
    }).save();

    return res.status(200).json({ message: '게시판이 생성되었습니다.', board: savedBoard });
  } catch (err) {
    console.error('게시판 생성 실패:', err);
    return res.status(500).json({ error: '게시판 생성 과정에서 오류가 발생했습니다.', details: err });
  }
};

export const getBoardList = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const boards = await Board.find();
    if (!boards || boards.length === 0) {
      return res.status(404).json({ error: '게시판 목록을 찾을 수 없습니다.' });
    }

    return res.status(200).json({ message: '게시판 목록을 성공적으로 불러왔습니다.', boards });
  } catch (err) {
    console.error('게시판 목록 불러오기 실패:', err);
    return res.status(500).json({ error: '게시판 목록을 불러오는 과정에서 오류가 발생했습니다.', details: err });
  }
};

// Post Controllers
export const getPostList = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { board_id, id: post_id } = req.query;
    const authHeader = req.headers.authorization;

    if (!board_id || !authHeader?.startsWith('Bearer ')) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const board = await Board.findById(board_id);
    if (!board) {
      return res.status(404).json({ error: '게시판을 찾을 수 없습니다.' });
    }

    let posts;
    if (post_id) {
      const post = await Post.findById(post_id);
      if (post) {
        post.view_count += 1;
        await post.save();
      }
      posts = post;
    } else {
      posts = await Post.find({ board_id: board_id as string });
    }

    if (!posts || (Array.isArray(posts) && posts.length === 0)) {
      return res.status(200).json({ message: '게시물이 없습니다.', board_name: board.name });
    }

    return res.status(200).json({
      message: '게시물 목록을 성공적으로 불러왔습니다.',
      board_name: board.name,
      posts,
    });
  } catch (err) {
    console.error('게시물 목록 불러오기 실패:', err);
    return res.status(500).json({ error: '게시물 목록을 불러오는 과정에서 오류가 발생했습니다.', details: err });
  }
};

export const writePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { title, content, board_id, token } = req.body;

    if (!title || !content || !board_id || !token) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const board = await Board.findById(board_id);
    if (!board) {
      return res.status(404).json({ error: '게시판을 찾을 수 없습니다.' });
    }

    const newPost = await new Post({
      author_id: decoded.user_id,
      author_name: decoded.user_name,
      post_title: title,
      post_content: content,
      board_id,
      view_count: 0,
      created_at: new Date(),
    }).save();

    return res.status(200).json({ message: '게시글이 생성되었습니다.', post: newPost });
  } catch (err) {
    console.error('게시글 생성 실패:', err);
    return res.status(500).json({ error: '게시글 생성 과정에서 오류가 발생했습니다.', details: err });
  }
};

export const editPost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { post_id, title, content, token } = req.body;

    if (!post_id || !title || !content || !token) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    post.post_title = title;
    post.post_content = content;
    const updatedPost = await post.save();

    return res.status(200).json({ message: '게시글이 수정되었습니다.', post: updatedPost });
  } catch (err) {
    console.error('게시글 수정 실패:', err);
    return res.status(500).json({ error: '게시글 수정 과정에서 오류가 발생했습니다.', details: err });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { post_id, token } = req.body;

    if (!post_id || !token) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    await Post.findByIdAndDelete(post_id);
    return res.status(200).json({ message: '게시글이 삭제되었습니다.' });
  } catch (err) {
    console.error('게시글 삭제 실패:', err);
    return res.status(500).json({ error: '게시글 삭제 과정에서 오류가 발생했습니다.', details: err });
  }
};

// Comment Controllers
export const getCommentList = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { post_id } = req.query;
    const authHeader = req.headers.authorization;

    if (!post_id || !authHeader?.startsWith('Bearer ')) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const comments = await Comment.find({ post_id });
    return res.status(200).json({ message: '댓글 목록을 성공적으로 불러왔습니다.', comments });
  } catch (err) {
    console.error('댓글 목록 불러오기 실패:', err);
    return res.status(500).json({ error: '댓글 목록을 불러오는 과정에서 오류가 발생했습니다.', details: err });
  }
};

export const writeComment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { post_id, content, token } = req.body;

    if (!post_id || !content || !token) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    const newComment = await new Comment({
      post_id,
      author_id: decoded.user_id,
      author_name: decoded.user_name,
      content,
      created_at: new Date(),
    }).save();

    return res.status(200).json({ message: '댓글이 작성되었습니다.', comment: newComment });
  } catch (err) {
    console.error('댓글 생성 실패:', err);
    return res.status(500).json({ error: '댓글 생성 과정에서 오류가 발생했습니다.', details: err });
  }
};

export const editComment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { comment_id, content, token } = req.body;

    if (!comment_id || !content || !token) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }

    comment.content = content;
    const updatedComment = await comment.save();

    return res.status(200).json({ message: '댓글이 수정되었습니다.', comment: updatedComment });
  } catch (err) {
    console.error('댓글 수정 실패:', err);
    return res.status(500).json({ error: '댓글 수정 과정에서 오류가 발생했습니다.', details: err });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { comment_id, token } = req.body;

    if (!comment_id || !token) {
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }

    await Comment.findByIdAndDelete(comment_id);
    return res.status(200).json({ message: '댓글이 삭제되었습니다.' });
  } catch (err) {
    console.error('댓글 삭제 실패:', err);
    return res.status(500).json({ error: '댓글 삭제 과정에서 오류가 발생했습니다.', details: err });
  }
};