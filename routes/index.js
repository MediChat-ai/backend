const router = require("express").Router();
const users = require("./users");
const community = require("./community");
const hospital = require("./hospital");

router.use("/users", users);
router.use("/community", community);
router.use("/hospital", hospital);

module.exports = router;