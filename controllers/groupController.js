const { Group } = require("../models/groupModel");
const { HttpError } = require("../helpers/HttpError");
const { User } = require("../models/userrModel");

async function getAllGroups(req, res) {
  try {
    const data = await Group.find({});
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

const getGroupById = async (req, res) => {
  const groupId = req.params.id; // Получаем ID из параметров запроса
console.log(groupId)
  try {
    const group = await Group.findById({_id: groupId}); // Найти группу по ID

    if (!group) {
      return res.status(404).json({ message: 'Group not found' }); // Если группа не найдена, вернуть 404
    }

    res.status(200).json(group); // Если группа найдена, вернуть её в ответе
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' }); // В случае ошибки сервера вернуть 500
  }
};

  const getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.id;
    debugger
    console.log(groupId)
    const members = await User.find({ "groups":  groupId });
    res.json(members);
  } catch (error) {
    console.log("gggg")
    res.status(500).json({ message: 'Internal server error' });
  }
};

async function updateGroup(id, req) {
  const result = await Group.findByIdAndUpdate(id, req, { new: true });
  if (!result) {
    throw HttpError(404, "not found");
  }
  return result;
}


const updateDailyGroupPayment = async(req, res) => {
  const groupId  = req.params.id; 
  const {newPrice} = req.body;

  if (typeof newPrice !== 'number' || newPrice <= 0) {
    return res.status(400).json({ message: 'Invalid price value' });
  }
  try{
      const result = await Group.findOneAndUpdate(
     { _id: groupId },  
     { $set: { 'payment.0.dailyPayment': newPrice } },
     { new: true });
  if (!result) {
    throw HttpError(404, "not found");
  }
  res.json(result);
  }
  catch {
    console.error('Error updating daily payment group price:', error);
    res.status(500).json({ message: 'Server error' }); 
  }

}


const updateMonthlyGroupPayment = async(req, res) => {
  const groupId  = req.params.id; 
  const {newPrice} = req.body;

  if (typeof newPrice !== 'number' || newPrice <= 0) {
    return res.status(400).json({ message: 'Invalid price value' });
  }
  try{
      const result = await Group.findOneAndUpdate(
     { _id: groupId },  
     { $set: { 'payment.0.monthlyPayment': newPrice } },
     { new: true });
  if (!result) {
    throw HttpError(404, "not found");
  }
  res.json(result);
  }
  catch {
    console.error('Error updating monthly payment group price:', error);
    res.status(500).json({ message: 'Server error' }); 
  }

}

const updateGroupSchedule = async(req, res) => {
  const groupId  = req.params.id; 
  const newSchedule = [];

  try{
      const result = await Group.findOneAndUpdate(
     { _id: groupId },  
     {  'schedule': [ newSchedule] },
     { new: true });
  if (!result) {
    throw HttpError(404, "not found");
  }
  res.json(result);
  }
  catch {
    console.error('Error updating schedule', error);
    res.status(500).json({ message: 'Server error' }); 
  }

}

const addGroup = async (req, res) => {
  try {
    const group = await Group.create({ ...req.body });

    res.status(201).json({
      title: group.title,
      coachId: group.coachId,
      payment: group.payment,
      schedule: group.schedule,
    });
  } catch (err) {
    console.error(err); // Логируйте ошибку для отладки
    res.status(500).json({ message: 'Server error' });
    // throw HttpError(500, "Server error"); // Это может быть убрано, если вы уже отправили ответ
  }
};



module.exports = {
  addGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  getGroupMembers,
  updateDailyGroupPayment,
  updateMonthlyGroupPayment,
  updateGroupSchedule
};
