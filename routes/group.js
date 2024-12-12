const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const {schemas} = require('../models/groupModel')
const controllers =require('../controllers/group/groupController')
// const isAdmin = require('../middlevares/isAdmin')


router.get("/",  controllers.getAllGroups)
router.get("/:id", controllers.getGroupById);
 router.post("/", validateBody(schemas.addGroupSchema), controllers.addGroup);
router.put('/:id', validateBody(schemas.addGroupSchema), controllers.updateGroup)
router.delete("/:id", controllers.deleteGroup)

module.exports = router //validateBody(schemas.updateGroupPriceSchema),