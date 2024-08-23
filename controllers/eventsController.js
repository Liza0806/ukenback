
const { Event } = require("../models/eventModel");
const { HttpError } = require("../helpers/HttpError");
// получить все тренировки из всех групп
const getAllEvents = async (req, res) => {
  try {
    const data = await Event.find({});
    res.json(data); // Статус 200 по умолчанию
  } catch (error) {
    HttpError(500, `Failed to retrieve groups ${error.message}`);
  }
};

// получить по ид
const getEventById = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.json(event);
  } catch (error) {
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
        $match: { date: { $gte: new Date(startDate), $lt: new Date(endDate) } },
      },
    ]);

    res.json(events);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error retrieving events: ${error.message}` });
  }
};

// по группе
const getEventsByGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const events = await Event.find({ group: groupId });

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
  const { _id, date, group, isCancelled, participants } = req.body;

  try {
    console.log(1)
    const newEvent = new Event({
      _id,
      date,
      group,
      isCancelled,
      participants,
    });
    console.log(2)
    await newEvent.save();
    console.log(3)
    return res.status(201).json(newEvent);
  } catch (error) {
    console.log(4)
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
  
};

// обновить
const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const updates = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    Object.assign(event, updates);
    await event.save();

    return res.json(event);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

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
