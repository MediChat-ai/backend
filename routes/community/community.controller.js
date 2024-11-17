require('dotenv').config();
const { Board, Comment, Post } = require('../../db/community');
const jwt = require('jsonwebtoken');

exports.createBoard = async (req, res) => {
  try {
    const { board_name, description, token } = req.body;
    if (!board_name || !description || !token)
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });
      else {
        Board.findOne({ name: board_name })
          .then(existingBoard => {
            if (existingBoard)
              return res.status(400).json({ error: '이미 존재하는 게시판 이름입니다.' });
            return new Board({
              name: board_name,
              description: description,
              created_at: new Date()
            }).save();
          })
          .then(savedBoard => {
            return res.status(200).json({ message: '계정이 생성되었습니다.', board: savedBoard });
          })
          .catch(err => {
            if (!res.headersSent)
              return res.status(500).json({ error: '게시판 조회 과정에서 오류가 발생했습니다.', details: err });
          });
      }
    });
  } catch (err) {
    console.error('데이터 생성 실패:', err);
    return res.status(500).json({ error: '게시판 생성 과정에서 오류가 발생했습니다.', details: err });
  }
}

exports.write = async (req, res) => {
  try {
    const { title, content, board_name, token } = req.body;
    if (!title || !content || !board_name || !token)
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });
      else {
        const board = await Board.findOne({ name: board_name });
        if (!board)
          return res.status(404).json({ error: '게시판을 찾을 수 없습니다.' });

        const newPost = new Post({
          author_id: decoded.user_id,
          post_title: title,
          post_content: content,
          board_name: board_name,
          created_at: new Date()
        });

        const savedPost = await newPost.save();
        return res.status(200).json({ message: '게시글이 생성되었습니다.', post: savedPost });
      }
    });
  } catch (err) {
    console.error('게시글 생성 실패:', err);
    return res.status(500).json({ error: '게시글 생성 과정에서 오류가 발생했습니다.', details: err });
  }
};

exports.comment = async (req, res) => {
  try {
    const { post_id, content, token } = req.body;
    if (!post_id || !content || !token)
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });
      try {
        const post = await Post.findById(post_id);
        if (!post)
          return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });

        const newComment = new Comment({
          post_id: post_id,
          author_id: decoded.user_id,
          content: content,
          created_at: new Date()
        });

        const savedComment = await newComment.save();
        return res.status(200).json({ message: '댓글이 작성되었습니다.', comment: savedComment });
      }
      catch (err) {
        console.error('댓글 생성 실패:', err);
        return res.status(500).json({ error: '댓글 생성 과정에서 오류가 발생했습니다.', details: err });
      }
    });
  } catch (err) {
    console.error('댓글 생성 실패:', err);
    return res.status(500).json({ error: '댓글 생성 과정에서 오류가 발생했습니다.', details: err });
  }
}

exports.deletePost = async (req, res) => {
  try {
    const { post_id, token } = req.body;
    if (!post_id || !token)
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });

      const post = await Post.findById(post_id);
      if (!post)
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });

      await Post.findByIdAndDelete(post_id);
      return res.status(200).json({ message: '게시글이 삭제되었습니다.' });
    });
  } catch (err) {
    console.error('게시글 삭제 실패:', err);
    return res.status(500).json({ error: '게시글 삭제 과정에서 오류가 발생했습니다.', details: err });
  }
}

exports.deleteComment = async (req, res) => {
  try {
    const { comment_id, token } = req.body;
    if (!comment_id || !token)
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });

      const comment = await Comment.findById(comment_id);
      if (!comment)
        return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });

      await Comment.findByIdAndDelete(comment_id);

      return res.status(200).json({ message: '댓글이 삭제되었습니다.' });
    });
  } catch (err) {
    console.error('댓글 삭제 실패:', err);
    return res.status(500).json({ error: '댓글 삭제 과정에서 오류가 발생했습니다.', details: err });
  }
}

exports.editPost = async (req, res) => {
  try {
    const { post_id, title, content, token } = req.body;
    if (!post_id || !title || !content || !token)
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });

      const post = await Post.findById(post_id);
      if (!post)
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });

      post.post_title = title;
      post.post_content = content;
      const updatedPost = await post.save();

      return res.status(200).json({ message: '게시글이 수정되었습니다.', post: updatedPost });
    });
  } catch (err) {
    console.error('게시글 수정 실패:', err);
    return res.status(500).json({ error: '게시글 수정 과정에서 오류가 발생했습니다.', details: err });
  }
}

exports.editComment = async (req, res) => {
  try {
    const { comment_id, content, token } = req.body;
    if (!comment_id || !content || !token)
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });

      const comment = await Comment.findById(comment_id);
      if (!comment)
        return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });

      comment.content = content;
      const updatedComment = await comment.save();

      return res.status(200).json({ message: '댓글이 수정되었습니다.', comment: updatedComment });
    });
  } catch (err) {
    console.error('댓글 수정 실패:', err);
    return res.status(500).json({ error: '댓글 수정 과정에서 오류가 발생했습니다.', details: err });
  }
}