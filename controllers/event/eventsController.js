const { Event, schemas } = require("../../models/eventModel");
const { validateData } = require("../../helpers/validators");
const { HttpError } = require("../../helpers/HttpError");
const { nanoid } = require("nanoid");

// получить все тренировки из всех групп
const getAllEvents = async (req, res) => {
  try {
    const data = await Event.find({});
    res.json(data); // Статус 200 по умолчанию
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ message: `Error getting events: ${error.message}` });
  }
};

// получить по ид
const getEventById = async (req, res) => {
  const { eventId } = req.params;
  debugger
  try {
    debugger
    const event = await Event.findById(eventId);

    if (!event) {
      debugger
      return res.status(404).json({ message: "Event not found" });
    }
    debugger
    return res.json(event);
  } catch (error) {
    debugger
    return res
      .status(500)
      .json({ message: `Error getting event: ${error.message}` });
  }
};

// получить по дате
// http://localhost:3201/events/?startDate=2024-01-01&endDate=2024-01-31
const getEventsByDate = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Both startDate and endDate are required." });
  }

  try {
    const events = await Event.aggregate([
      {
        $addFields: {
          dateAsDate: { $toDate: "$date" },
        },
      },
      {
        $match: {
          dateAsDate: {
            $gte: new Date(startDate), // Включительно
            $lt: new Date(endDate), // Исключительно
          },
        },
      },
    ]);

    return res.json(events).status(200);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error getting events: ${error.message}` });
  }
};

// по группе
const getEventsByGroup = async (req, res) => {
  const { groupId } = req.params;
  if (!groupId) {
    return res.status(400).json({ message: "GroupId is required." });
  }
  try {
    const events = await Event.find({ groupId: groupId });

    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "No events found for this group" });
    }

    return res.json(events);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

// создать
const createEvent = async (req, res) => {
  debugger
  const { date, groupId, isCancelled, groupTitle, participants } = req.body;
  const event = { date, groupId, groupTitle, isCancelled, participants };
  debugger
  if (!date || !groupId || isCancelled === undefined || !participants) {
    debugger
    return res.status(400).json({
      message:
        "Bad Request: Missing required fields (date, group, isCancelled, participants)",
    });
  }

  try {
    // Выполняем валидацию
    const validatedData = validateData(schemas.eventSchemaJoi, event);
     console.log(validatedData, 'validatedData'); // Логируем результат валидации
    debugger
    const newEvent = new Event({
      _id: nanoid(),
      date: validatedData.date,
      groupId: validatedData.groupId,
      groupTitle: validatedData.groupTitle,
      isCancelled: validatedData.isCancelled,
      participants: validatedData.participants,
    });
    debugger
    
    const savedEvent = await newEvent.save(); // Save the event to the database
console.log(savedEvent, 'savedEvent')
    debugger
    // Return the event with its ID
    return res.status(201).json(savedEvent);
  } catch (error) {
    if (error.message.startsWith("Validation error")) {
      debugger
      return res.status(400).json({ message: error.message });
    }

    // Log the error
    console.error("Error during event creation:", error);
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};


// обновить
const updateEvent = async (req, res) => {
  debugger
  const { eventId } = req.params;
  const { date, groupId, groupTitle, isCancelled, participants } = req.body;

  debugger
  const newEvent = { _id: eventId, date, groupId, groupTitle, isCancelled, participants };
  debugger
  try {
    // Найти существующее событие
    debugger
    const event = await Event.findById(eventId);
    debugger
    if (!event) {
      debugger
      return res.status(404).json({ message: "Event not found" });
    }
    // Выполняем валидацию
    debugger
    const validatedData = validateData(schemas.updateEventSchemaJoi, newEvent);
    // Обновляем событие валидированными данными
    debugger
    Object.assign(event, validatedData);

    // Сохраняем обновленное событие
    await event.save();

    return res.json(event);
  } catch (error) {
    if (error.message.startsWith("Validation error")) {
      // Возвращаем 400 в случае ошибки валидации
      return res.status(400).json({ message: error.message });
    }

    // Логирование ошибки
    console.error("Error during event update:", error);

    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

// {
//   "_id": "event1_20240925",
//   "date": "2025-09-25T08:00:00.000Z",
//   "group": "group4",
//   "isCancelled": false,
//   "participants": [
//     { "id": "user1", "name": "John" },
//     { "id": "user2", "name": "Jane" }
//   ]
// }

// удалить
const deleteEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await Event.findByIdAndDelete(eventId);

    if (!result) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json({ message: "Event successfully deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

// const updateEventDateTime = (event, date, time) => {
//   if (date && time) {
//     event.date = formatDateTime(date, time);
//   } else if (date) {
//     event.date = date;
//   } else if (time) {
//     event.date = updateTime(event.date, time);
//   }
// };

// const formatDateTime = (date, time) => {
//   return `${date}T${time}:00Z`;
// };

// const updateTime = (dateString, time) => {
//   const date = new Date(dateString);
//   const [hours, minutes] = time.split(":");
//   date.setUTCHours(hours);
//   date.setUTCMinutes(minutes);
//   return date.toISOString();
// };

module.exports = {
  getAllEvents,
  getEventById,
  getEventsByDate,
  getEventsByGroup,
  createEvent,
  updateEvent,
  deleteEvent,
};
