const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const {schemas} = require('../models/eventModel')
const controllers =require('../controllers/eventsController')

router.get('/', controllers.getAllEvents);
router.get('/last-month', controllers.getEventsForLastMonth)
router.get('/today',  controllers.getTodaysEvents)
router.get('/users/:userId/calendar', controllers.getEventsByUser);
router.get('/:eventId', controllers.getEventById);
router.put('/:eventId/time', controllers.changeOneEventTime);
router.get('/:eventId/participants', controllers.getOneEventParticipants);
router.put('/:eventId/participants', controllers.changeOneEventParticipants);


module.exports = router 