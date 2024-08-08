const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')

const controllers =require('../controllers/authController')
const authentificate = require('../middlevares/autentificate')
const upload = require('../middlevares/upload')
const { schemas } = require('../models/userrModel')

 router.post("/register", validateBody(schemas.registerSchema), controllers.register)

 router.post("/login",validateBody(schemas.loginSchema),controllers.login);

router.get("/current", authentificate, controllers.getCurrent);

// router.post("/logout", authentificate, controllers.logout);

// router.put("/avatars", authentificate, upload.single('avatar'), controllers.updateAvatar)

// router.get("/verify/:verificationCode", controllers.verifyEmail);

// router.post("/verify", validateBody(schemas.emailSchema), controllers.resendVerifyEmail);

module.exports = router
