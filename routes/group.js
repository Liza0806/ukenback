const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const {schemas} = require('../models/groupModel')
const controllers =require('../controllers/group/groupController')


/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Получить все группы
 *     responses:
 *       200:
 *         description: Список всех групп
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", controllers.getAllGroups);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Получить группу по ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID группы
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Группа найдена
 *       404:
 *         description: Группа не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:id", controllers.getGroupById);

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Создать новую группу
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       201:
 *         description: Группа успешно создана
 *       400:
 *         description: Неверный формат данных или ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", validateBody(schemas.addGroupSchema), controllers.addGroup);

/**
 * @swagger
 * /groups/{id}:
 *   put:
 *     summary: Обновить информацию о группе
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID группы
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Group'
 *     responses:
 *       200:
 *         description: Группа успешно обновлена
 *       400:
 *         description: Неверный формат данных или ошибка валидации
 *       404:
 *         description: Группа не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.put('/:id', validateBody(schemas.addGroupSchema), controllers.updateGroup);

/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     summary: Удалить группу по ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID группы
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Группа успешно удалена
 *       404:
 *         description: Группа не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/:id", controllers.deleteGroup)

module.exports = router