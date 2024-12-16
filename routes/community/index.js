const router = require("express").Router();
const communityController = require("./community.controller");

router.post("/createBoard", communityController.createBoard);
router.get("/getBoardList", communityController.getBoardList);
router.get("/getPostList", communityController.getPostList);
router.post("/writePost", communityController.writePost);
router.put("/editPost", communityController.editPost);
router.delete("/deletePost", communityController.deletePost);
router.get('/getCommentList', communityController.getCommentList);
router.post("/writeComment", communityController.writeComment);
router.put("/editComment", communityController.editComment);
router.delete("/deleteComment", communityController.deleteComment);

module.exports = router;