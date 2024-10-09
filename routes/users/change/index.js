const router = require('express').Router();
const changeController = require("./change.controller")

router.post("/username", changeController.username)

module.exports = router;