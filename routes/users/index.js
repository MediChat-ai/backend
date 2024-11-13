const router = require("express").Router();
const userController = require("./users.controller");
const change = require("./change");
const oauth = require("./oauth");

router.use("/change", change);
router.use("/oauth", oauth);

router.post("/login", userController.login);
router.post("/register", userController.register);
router.post("/auth", userController.auth);

module.exports = router;