const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const {schemas} = require('../models/groupModel')
const controllers =require('../controllers/groupController')
const authentificate = require('../middlevares/autentificate')
const upload = require('../middlevares/upload')
const isAdmin = require('../middlevares/isAdmin')


router.get("/",  controllers.getAllGroups)
router.get("/:id", controllers.getGroupById);
router.get('/:id/members', controllers.getGroupMembers)
router.patch("/:id/d_payment",  controllers.updateDailyGroupPayment);
router.patch("/:id/m_payment",  controllers.updateMonthlyGroupPayment); // добавь схемы и мидлвары сюда и выше

router.patch("/:id/schedule", controllers.updateGroupScheduleSchema);

// router.post("/verify/:verificationCode", controllers.verifyEmail);

router.post("/", validateBody(schemas.addGroupSchema), isAdmin, controllers.addGroup);

module.exports = router //validateBody(schemas.updateGroupPriceSchema),