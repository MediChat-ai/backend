const router = require("express").Router();
const oauthController = require("./oauth.controller");

router.post("/google", oauthController.google);
router.post("/naver", oauthController.naver)
// router.post("/github", oauthController.github)

module.exports = router;