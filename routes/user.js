const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const {schemas} = require('../models/userrModel')
const controllers =require('../controllers/userController')
// const authentificate = require('../middlevares/autentificate')
// const upload = require('../middlevares/upload')

//router.patch("/:id/d_payment",  controllers.updateDailyGroupPayment);
