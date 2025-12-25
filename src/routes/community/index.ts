import { Router } from 'express';
import * as communityController from './community.controller';

const router = Router();

// Board routes
router.post('/createBoard', communityController.createBoard);
router.get('/getBoardList', communityController.getBoardList);

// Post routes
router.get('/getPostList', communityController.getPostList);
router.post('/writePost', communityController.writePost);
router.put('/editPost', communityController.editPost);
router.delete('/deletePost', communityController.deletePost);

// Comment routes
router.get('/getCommentList', communityController.getCommentList);
router.post('/writeComment', communityController.writeComment);
router.put('/editComment', communityController.editComment);
router.delete('/deleteComment', communityController.deleteComment);

export default router;
