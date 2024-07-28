const { Group } = require("../models/groupModel");
const { HttpError } = require("../helpers/HttpError");
const { User } = require("../models/userrModel");
const { required } = require("joi");
const {generateEventsForMonth} = require('../plans/nextMonthEvent')


const getAllGroups = async (req, res) => {
  try {
    const data = await Group.find({});
    res.json(data); // Статус 200 по умолчанию
  } catch (error) {
    console.error('Error retrieving groups:', error);
    res.status(500).json({ message: "Failed to retrieve groups", error: error.message });
  }
};

const getGroupById = async (req, res) => {
  const groupId = req.params.id; // Получаем ID из параметров запроса

  try {
    const group = await Group.findById(groupId); // Найти группу по ID

    if (!group) {
      return res.status(404).json({ message: 'Group not found' }); // Если группа не найдена, вернуть 404
    }

    res.json(group); 
  } catch (error) {
    console.error('Error retrieving group by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve group', error: error.message }); // В случае ошибки сервера вернуть 500
  }
};
const getGroupMembers = async (req, res) => {
  const groupId = req.params.id;

  try {
    const members = await User.find({ groups: groupId });
    res.json(members); // Статус 200 по умолчанию
  } catch (error) {
    console.error('Error retrieving group members:', error);
    res.status(500).json({ message: 'Failed to retrieve group members', error: error.message });
  }
};


// async function updateGroup(id, req) {
//   const result = await Group.findByIdAndUpdate(id, req, { new: true });
//   if (!result) {
//     throw HttpError(404, "not found");
//   }
//   return result;
// }

const updateDailyGroupPayment = async (req, res) => {
  const groupId = req.params.id; 
  const { newPrice } = req.body;

  if (typeof newPrice !== 'number' || newPrice <= 0) {
    return res.status(400).json({ message: 'Invalid price value' });
  }

  try {
    const result = await Group.findOneAndUpdate(
      { _id: groupId },  
      { $set: { 'payment.0.dailyPayment': newPrice } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating daily group payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message }); 
  }
};
// {
//   "newPrice": 555
// }

const updateMonthlyGroupPayment = async (req, res) => {
  const groupId = req.params.id; 
  const { newPrice } = req.body;

  if (!isValidPrice(newPrice)) {
    return res.status(400).json({ message: 'Invalid price value' });
  }

  try {
    const result = await updateGroupPayment(groupId, newPrice);

    if (!result) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating monthly payment group price:', error);
    res.status(500).json({ message: 'Server error' }); 
  }
}

const isValidPrice = (price) => typeof price === 'number' && price > 0;

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


// const updateGroupSchedule = async (req, res) => {
//   const groupId = req.params.id; // Получаем ID из параметров запроса
//   console.log(groupId)
//     try {
//       const group = await Group.findById({_id: groupId}); // Найти группу по ID
//       const { schedule } = req.body;
//       if (!group) {
//         return res.status(404).json({ message: 'Group not found' }); // Если группа не найдена, вернуть 404
//       }
//   group.schedule = [...schedule]
//       res.status(200).json(group); 
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Server error' }); // В случае ошибки сервера вернуть 500
//     }
// }

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
