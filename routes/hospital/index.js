const router = require('express').Router();
const hospitalController = require("./hospital.controller");

router.get("/getHospList", hospitalController.getHospList);

module.exports = router;