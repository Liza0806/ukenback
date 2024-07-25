const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const {schemas} = require('../models/groupModel')
const controllers =require('../controllers/groupController')
const authentificate = require('../middlevares/autentificate')
const upload = require('../middlevares/upload')



router.get("/",  controllers.getAllGroups)
router.get("/:id", controllers.getGroupById);
router.get('/:id/members', controllers.getGroupMembers)
router.patch("/:id/d_payment",  controllers.updateDailyGroupPayment);
router.patch("/:id/m_payment",  controllers.updateMonthlyGroupPayment);

// router.put("/groups/:id", validateBody(schemas.updateGroupSceduleSchema), controllers.updateGroupSceduleSchema);

// router.post("/verify/:verificationCode", controllers.verifyEmail);

// router.post("/groups/new", validateBody(schemas.addGroupSchema), controllers.addGroup);

module.exports = router //validateBody(schemas.updateGroupPriceSchema),