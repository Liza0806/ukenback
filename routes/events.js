const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const controllers =require('../controllers/event/eventsController')
const {schemas} = require('../models/eventModel')

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить все события
 *     responses:
 *       200:
 *         description: Список всех событий
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', controllers.getAllEvents);
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить все будущие события
 *     responses:
 *       200:
 *         description: Список всех предстоящих событий
 *       500:
 *         description: Ошибка сервера
 */
router.get('/future', controllers.getFutureEvents)
/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Получить событие по ID
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         description: ID события
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Событие найдено
 *       404:
 *         description: Событие не найдено
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:eventId', controllers.getEventById);

/**
 * @swagger
 * /events/date:
 *   get:
 *     summary: Получить события по дате
 *     parameters:
 *       - name: date
 *         in: query
 *         required: true
 *         description: Дата события в формате YYYY-MM-DD
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Список событий для указанной даты
 *       400:
 *         description: Неверный формат даты
 *       500:
 *         description: Ошибка сервера
 */
router.get('/date', controllers.getEventsByDate);

/**
 * @swagger
 * /events/groups/{groupId}:
 *   get:
 *     summary: Получить события по ID группы
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: ID группы
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список событий для указанной группы
 *       404:
 *         description: Группа не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get('/groups/:groupId', controllers.getEventsByGroup);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создать новое событие
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Событие успешно создано
 *       400:
 *         description: Неверный формат данных или валидация не прошла
 *       500:
 *         description: Ошибка сервера
 */
router.post('/', validateBody(schemas.eventSchemaJoi), controllers.createEvent);

/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Обновить информацию о событии
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         description: ID события
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Событие успешно обновлено
 *       400:
 *         description: Неверный формат данных или валидация не прошла
 *       404:
 *         description: Событие не найдено
 *       500:
 *         description: Ошибка сервера
 */
router.put('/:eventId', validateBody(schemas.updateEventSchemaJoi), controllers.updateEvent);

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Удалить событие по ID
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         description: ID события
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Событие успешно удалено
 *       404:
 *         description: Событие не найдено
 *       500:
 *         description: Ошибка сервера
 */
router.delete('/:eventId', controllers.deleteEvent);

module.exports = router;
