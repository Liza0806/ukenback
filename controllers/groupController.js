const { Group } = require("../models/groupModel");
const { HttpError } = require("../helpers/HttpError");
const { User } = require("../models/userrModel");
const {generateEventsForMonth} = require('../plans/nextMonthEvent')

/// Получить все группы
const getAllGroups = async (req, res) => {
  try {
    const data = await Group.find({});
    res.json(data); // Статус 200 по умолчанию
  } catch (error) {
    HttpError(500, `Failed to retrieve groups ${error.message}`)
  }
};

/// Получить 1 по ид
const getGroupById = async (req, res) => {
  const groupId = req.params.id; // Получаем ID из параметров запроса

  try {
    const group = await Group.findById(groupId); // Найти группу по ID

    if (!group) {
      return HttpError(404, 'Group not found')
    }

    res.json(group); 
  } catch (error) {
    HttpError(500, `Failed to retrieve group ${error.message}`)
  }
};

/// Получить членов группы

const getGroupMembers = async (req, res) => {
  const groupId = req.params.id;

  try {
    const members = await User.find({ groups: groupId });
    res.json(members); // Статус 200 по умолчанию
  } catch (error) {
    HttpError(500, `Failed to retrieve group members ${error.message}`)
  }
};

const updateDailyGroupPayment = async (req, res) => {
  const groupId = req.params.id; 
  const { newPrice } = req.body;

  if (typeof newPrice !== 'number' || newPrice <= 0) {
    return HttpError(400,'Invalid price value')
  }

  try {
    const result = await Group.findOneAndUpdate(
      { _id: groupId },  
      { $set: { 'payment.0.dailyPayment': newPrice } },
      { new: true }
    );

    if (!result) {
      return HttpError(404, 'Group not found')
    }
    res.json(result);
   
  }
catch{
  return HttpError(500, `Server error ${error.message}`)
}
};


const updateMonthlyGroupPayment = async (req, res) => {
  const groupId = req.params.id; 
  const { newPrice } = req.body;

  const isValidPrice = (price) => typeof price === 'number' && price > 0;

  if (!isValidPrice(newPrice)) {
    return HttpError(400,  'Invalid price value' )
  }
  try {
    const result = await updateGroupPayment(groupId, newPrice);

    if (!result) {
      return HttpError(404)
    }

    res.json(result);
  } catch (error) {
    HttpError(500, `Server error ${error.message}`)
  }
}



const updateGroupPayment = async (groupId, newPrice) => {
  return Group.findOneAndUpdate(
    { _id: groupId },
    { $set: { 'payment.0.monthlyPayment': newPrice } },
    { new: true }
  );
}


const updateGroupSchedule = async (req, res) => {
  const groupId = req.params.id; 
  const newSchedule = req.body;

  if (!Array.isArray(newSchedule)) {
    return res.status(400).json({ message: 'Invalid schedule format' });
  }

  try {
    const result = await updateSchedule(groupId, newSchedule);

    if (!result) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Server error' }); 
  }
}

const updateSchedule = async (groupId, newSchedule) => {
  return Group.findOneAndUpdate(
    { _id: groupId },
    { schedule: [...newSchedule] },
    { new: true }
  );
}


const addGroup = async (req, res) => {
  const { title, coachId, payment, schedule } = req.body;

  if (!isValidGroupData({ title, coachId, payment, schedule })) {
    return res.status(400).json({ message: 'Invalid group data' });
  }

  try {
    const group = await Group.create({ title, coachId, payment, schedule });

    const { _id, title: groupTitle, coachId: groupCoachId, payment: groupPayment, schedule: groupSchedule } = group;

    res.status(201).json({
      id: _id,
      title: groupTitle,
      coachId: groupCoachId,
      payment: groupPayment,
      schedule: groupSchedule,
    });
  } catch (err) {
    console.error('Error adding group:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const isValidGroupData = ({ title, coachId, payment, schedule }) => {
  return typeof title === 'string' && 
         typeof coachId === 'string' && 
         Array.isArray(payment) &&
         Array.isArray(schedule);
};

/// добавить участника и удалить участника
/// поиск по участникам

module.exports = {
  addGroup,
  getAllGroups,
  getGroupById,
  getGroupMembers,
  updateDailyGroupPayment,
  updateMonthlyGroupPayment,
  updateGroupSchedule,
  updateGroupSchedule
};
