const router = require("express").Router();
const users = require("./users");
const community = require("./community");

router.use("/users", users);
router.use("/community", community);

module.exports = router;