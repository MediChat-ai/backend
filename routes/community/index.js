const router = require("express").Router();
const communityController = require("./community.controller");
// const oauth = require("./oauth");

// router.use("/change", change);
// router.use("/oauth", oauth);

router.post("/createBoard", communityController.createBoard);
router.post("/write", communityController.write);
router.post("/comment", communityController.comment);
router.post("/deletePost", communityController.deletePost);
router.post("/deleteComment", communityController.deleteComment);
router.post("/editPost", communityController.editPost);
router.post("/editComment", communityController.editComment);
// router.post("/register", userController.register);
// router.post("/auth", userController.auth);

module.exports = router;