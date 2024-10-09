const router = require("express").Router()
const userController = require("./users.controller")
const change = require("./change");

router.use("/change", change);

router.post("/login", userController.login)
router.post("/register", userController.register)
router.post("/auth", userController.auth)

module.exports = router