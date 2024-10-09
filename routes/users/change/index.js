const router = require('express').Router();
const changeController = require("./change.controller")

router.post("/username", changeController.username)
router.post("/password", changeController.password)

module.exports = router;