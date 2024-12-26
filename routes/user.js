const express = require("express");
const router = express.Router();
const validateBody = require("../middlevares/vaidateBody");
const { schemas } = require("../models/userModel");
const controllers = require("../controllers/user/userController");

/**
 * @swagger
 * /:
 *   get:
 *     summary: Получить список всех пользователей
 *     responses:
 *       200:
 *         description: Список пользователей успешно получен.
 */
router.get("/", controllers.getAllUsers);

/**
 * @swagger
 * /{userId}:
 *   get:
 *     summary: Получить пользователя по ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя успешно получены.
 *       404:
 *         description: Пользователь не найден.
 */
router.get("/:userId", controllers.getUserByUserId);

/**
 * @swagger
 * /:
 *   post:
 *     summary: Добавить нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Пользователь успешно добавлен.
 *       400:
 *         description: Ошибка валидации.
 */
router.post('/', validateBody(schemas.registerSchema), controllers.addUser);

/**
 * @swagger
 * /{userId}:
 *   put:
 *     summary: Обновить данные пользователя
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Данные пользователя успешно обновлены.
 *       400:
 *         description: Ошибка валидации.
 */
router.put("/:userId", validateBody(schemas.updateSchema), controllers.updateUser);

/**
 * @swagger
 * /{userId}:
 *   delete:
 *     summary: Удалить пользователя
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь успешно удален.
 *       404:
 *         description: Пользователь не найден.
 */
router.delete("/:userId", controllers.deleteUser);

/**
 * @swagger
 * /{userId}/visits:
 *   post:
 *     summary: Добавить посещение для пользователя
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Visit'
 *     responses:
 *       201:
 *         description: Посещение успешно добавлено.
 */
router.post("/:userId/visits", controllers.addVisit);

/**
 * @swagger
 * /{userId}/balance:
 *   patch:
 *     summary: Обновить баланс пользователя
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               balance:
 *                 type: number
 *                 description: Новый баланс
 *     responses:
 *       200:
 *         description: Баланс успешно обновлен.
 *       400:
 *         description: Ошибка валидации.
 */
router.patch("/:userId/balance", controllers.updateUserBalance);

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Найти пользователей по имени
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Имя пользователя
 *     responses:
 *       200:
 *         description: Пользователи успешно найдены.
 */
router.get("/search", controllers.getUsersByName);

/**
 * @swagger
 * /{userId}/groups:
 *   get:
 *     summary: Получить группы пользователя
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Список групп успешно получен.
 *       404:
 *         description: Пользователь не найден.
 */
router.get("/:userId/groups", controllers.getUserGroups);
module.exports = router;
