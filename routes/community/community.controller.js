require('dotenv').config();
const { Board, Comment, Post } = require('../../db/community');
const jwt = require('jsonwebtoken');

exports.createBoard = async (req, res) => {
  try {
    const { board_name, description, token, cover_url } = req.body;
    if (!board_name || !description || !token || !cover_url)
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
              created_at: new Date(),
              cover_url: cover_url
            }).save();
          })
          .then(savedBoard => {
            return res.status(200).json({ message: '게시판이 생성되었습니다.', board: savedBoard });
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

exports.getBoardList = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer '))
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    const jwtToken = token.split(' ')[1];
    jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });
      const boards = await Board.find();
      if (!boards || boards.length === 0)
        return res.status(404).json({ error: '게시판 목록을 찾을 수 없습니다.' });

      return res.status(200).json({ message: '게시판 목록을 성공적으로 불러왔습니다.', boards });
    });
  } catch (err) {
    console.error('게시판 목록 불러오기 실패:', err);
    return res.status(500).json({ error: '게시판 목록을 불러오는 과정에서 오류가 발생했습니다.', details: err });
  }
}

exports.getPostList = async (req, res) => {
  try {
    const board_id = req.query.board_id;
    const post_id = req.query.id;
    const token = req.headers.authorization;
    if (!board_id || !token || !token.startsWith('Bearer '))
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    const jwtToken = token.split(' ')[1];
    jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, decoded) => {
      try {
        if (err)
          return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });

        let posts;
        if (post_id) {
          posts = await Post.findById(post_id);
        } else {
          posts = await Post.find({ board_id: board_id });
        }
        if (!posts || posts.length === 0)
          return res.status(404).json({ error: '게시물 목록을 찾을 수 없습니다.' });
        const board = await Board.findById(board_id);
        if (!board)
          return res.status(404).json({ error: '게시판을 찾을 수 없습니다.' });
        return res.status(200).json({ message: '게시물 목록을 성공적으로 불러왔습니다.', board_name: board.name, posts });
      } catch (err) {
        console.error('게시물 목록 불러오기 실패:', err);
        return res.status(500).json({ error: '게시물 목록을 불러오는 과정에서 오류가 발생했습니다.', details: err });
      }
    });

  } catch (err) {
    console.error('게시물 목록 불러오기 실패:', err);
    return res.status(500).json({ error: '게시물 목록을 불러오는 과정에서 오류가 발생했습니다.', details: err });
  }
}

exports.writePost = async (req, res) => {
  try {
    const { title, content, board_id, token } = req.body;
    if (!title || !content || !board_id || !token)
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      try {
        if (err)
          return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });
        else {
          const board = await Board.findById(board_id);
          if (!board)
            return res.status(404).json({ error: '게시판을 찾을 수 없습니다.' });

          const newPost = new Post({
            author_name: decoded.user_name,
            post_title: title,
            post_content: content,
            board_id: board_id,
            view_count: 0,
            created_at: new Date()
          });

          const savedPost = await newPost.save();
          return res.status(200).json({ message: '게시글이 생성되었습니다.', post: savedPost });
        }
      } catch (err) {
        console.error('게시글 생성 실패:', err);
        return res.status(500).json({ error: '게시글 생성 과정에서 오류가 발생했습니다.', details: err });
      }
    });
  } catch (err) {
    console.error('게시글 생성 실패:', err);
    return res.status(500).json({ error: '게시글 생성 과정에서 오류가 발생했습니다.', details: err });
  }
};

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

exports.getCommentList = async (req, res) => {
  try {
    const postId = req.query.post_id;
    const token = req.headers.authorization;
    if (!postId || !token || !token.startsWith('Bearer '))
      return res.status(400).json({ error: '필수 파라미터 값이 누락되었습니다.' });

    const jwtToken = token.split(' ')[1];
    jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: err });
      try {
        const comments = await Comment.find({ post_id: postId });
        if (!comments)
          return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
        return res.status(200).json({ message: '댓글 목록을 성공적으로 불러왔습니다.', comments });
      } catch (err) {
        console.error('댓글 목록 불러오기 실패:', err);
        return res.status(500).json({ error: '댓글 목록을 불러오는 과정에서 오류가 발생했습니다.', details: err });
      }
    });
  } catch (err) {
    console.error('댓글 목록 불러오기 실패:', err);
    return res.status(500).json({ error: '댓글 목록을 불러오는 과정에서 오류가 발생했습니다.', details: err });
  }
}

exports.writeComment = async (req, res) => {
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
          author_name: decoded.user_name,
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