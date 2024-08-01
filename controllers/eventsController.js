const { Group } = require("../models/groupModel");
const { HttpError } = require("../helpers/HttpError");
//const { Event } = require("../models/eventModel");
const { User } = require("../models/userrModel");
const { getGroupMembers } = require("./groupController");

const getAllEvents = async (req, res) => {
    try {
      const allEvents = await getEventsFromAllGroups();
      res.json(allEvents);
    } catch (error) {
      console.error('Error retrieving events:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
  const getEventsFromAllGroups = async () => {
    const groups = await Group.find({});
    if (!groups || groups.length === 0) {
      return [];
    }
    
    return groups.flatMap(group => group.events);
  }
  //// isnt work
  const getEventsForLastMonth = async (req, res) => {
    try {
      const { startOfLastMonth, endOfLastMonth } = getLastMonthDateRange();
  
      const events = await getEventsByDateRange(startOfLastMonth, endOfLastMonth);
  
      res.json(events);
    } catch (error) {
      console.error('Error retrieving events for the last month:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  const getTodaysEvents = async (req, res) => {
    try {
      const today = new Date();
      // время на начало дня
      const startDate = new Date(today.setHours(0, 0, 0, 0));
      //на конец дня
      const endDate = new Date(today.setHours(23, 59, 59, 999));
  
      const events = await getEventsByDateRange(startDate, endDate);
  
      res.json(events);
    } catch (error) {
      console.error('Error retrieving events for today:', error);
      res.status(500).json({ message: 'Internal Server Error' });
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
  
  const getEventsByUser = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const groupsWithUserEvents = await Group.find({
        'events.participants': userId
      });
  
      const events = groupsWithUserEvents.flatMap(group => 
        group.events.filter(event => event.participants.includes(userId))
      );
  
      res.json(events);
    } catch (error) {
      console.error('Error retrieving events for user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

const getGroupByEventId = async (eventId) => {
  try {
    const group = await Group.findOne({ 'events._id': eventId });
    if (!group) {
      return { error: 'Event not found in any group' };
    }
    return { group };
  } catch (error) {
    console.error('Error getting group by event ID:', error);
    return { error: 'Internal Server Error' };
  }
}

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
      console.error('Error getting event:', error);
      return { error: 'Internal Server Error' };
    }
  }

  const getEventById = async (req, res) => {
    const { eventId } = req.params;
    const result = await getEventFunc(eventId);
  
    if (result.error) {
      return res.status(404).json({ message: result.error });
    }
  
    return res.json(result.event);
  }
  
const getOneEventParticipants = async (req, res) => {
  const { eventId } = req.params;
  const result = await getEventFunc(eventId);

  if (result.error) {
    return res.status(500).json({ message: result.error });
  }

const participants = [...result.event.participants]
  return res.json(result.event.participants);
}

const changeOneEventParticipants =  async (req, res) => {
  const participants = req.body;


}
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
        return res.status(404).json({ message: 'Event not found in any group' });
      }
  
      const event = group.events.id(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found in group' });
      }
  
      updateEventDateTime(event, date, time);
  
      await group.save();
  
      res.json(event);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Internal Server Error' });
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
  



    // {
    //     "date": "2024-07-26",
    //     "time": "14:30"
    // }
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