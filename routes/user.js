const express = require("express");
const router = express.Router();
const validateBody = require("../middlevares/vaidateBody");
const { schemas } = require("../models/userModel");
const controllers = require("../controllers/user/userController");

router.get("/", controllers.getAllUsers);
router.get("/:id", controllers.getUserByUserId);
router.post('/', validateBody(schemas.registerSchema), controllers.addUser);
router.patch("/:userId",validateBody(schemas.updateSchema), controllers.updateUser); /// напиши валидацию
router.delete("/:userId", controllers.deleteUser);
router.post("/:userId/visits", controllers.addVisit);
router.patch("/:userId/balance", controllers.updateUserBalance); /// напиши валидацию
router.get("/search", controllers.getUsersByName);


router.get("/:userId/groups", controllers.getUserGroups);

module.exports = router;
