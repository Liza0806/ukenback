const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const {schemas} = require('../models/userrModel')
const controllers =require('../controllers/userController')
// const authentificate = require('../middlevares/autentificate')
// const upload = require('../middlevares/upload')

//router.patch("/:id/d_payment",  controllers.updateDailyGroupPayment);


router.get('/', controllers.getAllUsers)
router.get('/:id', controllers.getUserById)

// 
// router.delete('/:id', controllers.deleteOneUser)
// router.get('/events', controllers.getOneUserEvents)
// router.patch('/discount', controllers.changeDiscountOnUser)


module.exports = router 