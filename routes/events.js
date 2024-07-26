const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const {schemas} = require('../models/eventModel')
const controllers =require('../controllers/eventsController')

router.get('/', controllers.getAllEvents);
router.get('/last-month', controllers.getEventsForLastMonth)
router.get('/users/:userId/calendar', controllers.getEventsByUser);
router.put('/:eventId', controllers.changeOneEventTime);
module.exports = router 