const { Group } = require("../models/groupModel");
const { HttpError } = require("../helpers/HttpError");
//const { Event } = require("../models/eventModel");
const { User } = require("../models/userrModel");
const { getGroupMembers } = require("./groupController");

/// получить все тренировки из всех групп

const getEventsFromAllGroups = async () => {
  const groups = await Group.find({});
  if (!groups || groups.length === 0) {
    return [];
  }
  
  return groups.flatMap(group => group.events);  
}
/// получить все тренировки (обертка)

const getAllEvents = async (req, res) => {
    try {
      const allEvents = await getEventsFromAllGroups();
      res.json(allEvents);
    } catch (error) {
      return HttpError(500, `Error retrieving events: ${error.message}`) // настроить выдачу группами
    }
  }
  

  //// isnt work
  const getEventsForLastMonth = async (req, res) => {
    try {
      const { startOfLastMonth, endOfLastMonth } = getLastMonthDateRange();
  
      const events = await getEventsByDateRange(startOfLastMonth, endOfLastMonth);
  
      res.json(events);
    } catch (error) {
      return HttpError(500, `Internal Server Error, ${error.message}`)
    }
  }

  /// получить все тренировки за сегодня

  const getTodaysEvents = async (req, res) => {
    try {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0));
      const endDate = new Date(today.setHours(23, 59, 59, 999));
  
      const events = await getEventsByDateRange(startDate, endDate);
  
      res.json(events);
    } catch (error) {
      return HttpError(500, `Error retrieving events for today:, ${error.message}`)
    }
  }


  ///this one for getEventsForLastMonth 
  const getLastMonthDateRange = () => {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return { startOfLastMonth, endOfLastMonth };
  }
   ///this one for getTodaysEvents
  const getEventsByDateRange = async (startDate, endDate) => {
    return Group.aggregate([
      { $unwind: '$events' },
      { $match: { 'events.date': { $gte: startDate, $lt: endDate } } },
      { $replaceRoot: { newRoot: '$events' } }
    ]);
  }
  
    /// получить все тренировки  по юзеру
    /// ПЕРЕПИШИ это вообще маршрут для юзера, не для ивентов
  // и поменяй в боте, чтобы он пушил ид с объекта, а не телеграм ид
  const getEventsByUser = async (req, res) => {
  //   const userId = req.params.userId;
  
  //   try {
  //     console.log(1)
  //     const groupsWithUserEvents = await Group.find({
  //       'events.participants': userId
  //     });
  //     console.log(2)
  //     const events = groupsWithUserEvents.flatMap(group => 
  //       group.events.filter(event => event.participants.includes(userId))
  //     );
  //     console.log(3)
  //     res.json(events);
  //     console.log(4)
  //   } catch (error) {
  //     return HttpError(500, `Error retrieving events for user:, ${error.message}`)
  //   }
   }

  /// ОДИНОЧНЫЕ ИВЕНТЫ

    /// получить группу по встрече (для getEventById) 
const getGroupByEventId = async (eventId) => {
  try {
    const group = await Group.findOne({ 'events._id': eventId });
    if (!group) {
      return { error: 'Event not found in any group' };
    }
    return { group };
  } catch (error) {
    return HttpError(500, `Error getting group by event ID:, ${error.message}`)
  }
}
    /// для getEventById
  const getEventFunc = async (eventId) => {
    try {
      const { group, error: groupError } = await getGroupByEventId(eventId);
      if (groupError) {
        return { error: groupError };
      }
  
      const event = group.events.id(eventId);
  
      if (!event) {
        return { error: 'Event not found in group' };
      }
      
      return { event };
    } catch (error) {
      return HttpError(500, `Error getting event:, ${error.message}`)
    }
  }
/// получить тренировку по ид
  const getEventById = async (req, res) => {
    const { eventId } = req.params;
    const result = await getEventFunc(eventId);
  
    if (result.error) {
      return HttpError(404, `Error getting event:, ${error.message}`) 
    }
  
    return res.json(result.event);
  }
  /// получить участников тренировки 
const getOneEventParticipants = async (req, res) => {
  const { eventId } = req.params;
  const result = await getEventFunc(eventId);

  if (result.error) {
    return HttpError(500, `Error getting event:, ${error.message}`)
  }

  return res.json(result.event.participants);
}

/// изменить состав участников тренировки (кто был, кто не был)
const changeOneEventParticipants =  async (req, res) => {
  const participants = req.body;
  const hipoteticalParticipants = User.find


}
/// добавить статус болел
/// изменить время 1 тренировки
  // const updateEventDateTime = (event, date, time) => {
  //   if (date && time) {
  //     event.date = formatDateTime(date, time);
  //   } else if (date) {
  //     event.date = date;
  //   } else if (time) {
  //     event.date = updateTime(event.date, time);
  //   }
  // }
  
  const changeOneEventTime = async (req, res) => {
    const { eventId } = req.params;
    const { date, time } = req.body;
  
    try {
      const group = await Group.findOne({ 'events._id': eventId });
      if (!group) {
        return HttpError(404, `Event not found in any group, ${error.message}`)
      }
  
      const event = group.events.id(eventId);
      if (!event) {
        return HttpError(404, `Event not found in group ${error.message}`)
      }
  
      updateEventDateTime(event, date, time);
  
      await group.save();
  
      res.json(event);
    } catch (error) {
      return HttpError(500, `Internal Server Error ${error.message}`)
    }
  }
  
  const updateEventDateTime = (event, date, time) => {
    if (date && time) {
      event.date = formatDateTime(date, time);
    } else if (date) {
      event.date = date;
    } else if (time) {
      event.date = updateTime(event.date, time);
    }
  }
  
  const formatDateTime = (date, time) => {
    return `${date}T${time}:00Z`;
  }
  
  const updateTime = (dateString, time) => {
    const date = new Date(dateString);
    const [hours, minutes] = time.split(':');
    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    return date.toISOString();
  }

  module.exports = {
    getEventsByUser,
    changeOneEventTime,
    getAllEvents,
    getEventsForLastMonth,
    getTodaysEvents,
    getOneEventParticipants,
    getEventById,
    changeOneEventParticipants
}