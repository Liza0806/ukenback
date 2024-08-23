const express = require('express')
const router = express.Router()
const validateBody = require('../middlevares/vaidateBody')
const controllers =require('../controllers/eventsController')
const {schemas} = require('../models/eventModel')

router.get('/', controllers.getAllEvents);
router.get('/:eventId', controllers.getEventById);
router.get('/date', controllers.getEventsByDate);
router.get('/groups/:groupId', controllers.getEventsByGroup); 
 router.post('/', validateBody(schemas.addEventSchema), controllers.createEvent); // добавь валидацию, чтобы лишних групп не понаписали
router.put('/:eventId', validateBody(schemas.addEventSchema), controllers.updateEvent);
router.delete('/:eventId', controllers.deleteEvent);

module.exports = router;
