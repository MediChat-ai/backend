const userRouter = require("express").Router()
const userController = require("./users.controller")

userRouter.post("/login", userController.login)
userRouter.post("/register", userController.register)

module.exports = userRouter