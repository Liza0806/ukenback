const mongoose = require("mongoose");
const { Group } = require("../../models/groupModel");
const { Event } = require("../../models/eventModel");
const { HttpError,makeScheduleForNewGroup } = require("../../helpers/HttpError");
const { User } = require("../../models/userModel");
const {
  isGroupScheduleSuitable,
  isGroupAlreadyExist,
  isValidGroupData,
} = require("../../helpers/validators");

/// Получить все группы
const getAllGroups = async (req, res) => {
  try {
    const data = await Group.find({});
    res.json(data); // Статус 200 по умолчанию
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ message: `Error getting groups: ${error.message}` });
  
  }
};

/// Получить 1 по ид
const getGroupById = async (req, res) => {
  const { id } = req.params; // Получаем ID из параметров запроса
  //console.log(id, 'id in getGroupById')
  try {
    const group = await Group.findById({ _id: id }); // Найти группу по ID

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error getting group: ${error.message}` });
  }
};
const addGroup = async (req, res) => {
  const { title, coachId, payment, schedule, participants } = req.body;

  try {
    const isValid = isValidGroupData({
      title,
      payment,
      coachId,
      schedule,
      participants,
    });
    if (!isValid) {
      return res.status(400).json({ message: "Invalid group data" });
    }

    const groupExists = await isGroupAlreadyExist({ title });
    if (groupExists) {
      return res.status(400).json({ message: "This title already exists" });
    }

    const scheduleCheck = await isGroupScheduleSuitable(schedule);
    if (scheduleCheck) {
      return res.status(400).json({ message: scheduleCheck });
    }

    const group = await Group.create({
      title,
      coachId,
      payment,
      schedule,
      participants,
    });

    const currentDate = new Date();
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Генерация событий с помощью вынесенной функции
    const events = makeScheduleForNewGroup(schedule, currentDate, endOfMonth, title, group._id.toString());

    if (events.length > 0) {
      await Event.insertMany(events);
    }

    return res.status(201).json({ group, events });
  } catch (err) {
    console.error("Error adding group:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


const updateGroup = async (req, res) => {
  // console.log(req.body, "updateGroup1");
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { title, payment, coachId, schedule, participants } = req.body;
    // Проверка валидности данных
    const isValid = isValidGroupData({
      title,
      payment,
      coachId,
      schedule,
      participants,
    });
    if (!isValid) {
      return res.status(400).json({ message: "Invalid group data" });
    }
    const updatedGroup = await Group.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // Если группа не найдена, возвращаем ошибку
    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Возвращаем обновленные данные группы
    res.status(200).json({ updatedGroup, _id: id });
  } catch (err) {
    // Логируем и возвращаем ошибку
    return res.status(500).json({ message: `Internal Server Error:` });
  }
};

const deleteGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedGroup = await Group.findByIdAndDelete(id);

    if (!deletedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Удаление будущих событий, связанных с группой
    const result = await Event.deleteMany({
      groupTitle: deletedGroup.title,
      date: { $gt: new Date().toISOString() }, // Сравнение с ISO-строкой
    });

    // Формирование ответа
    const eventMessage =
      result.deletedCount > 0
        ? "Associated future events successfully deleted"
        : "No associated future events found";

    return res.status(200).json({
      message: `Group deleted. ${eventMessage}`,
      _id: id,
    });
  } catch (error) {
    console.log("Error in deleteGroup controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/// добавить участника и удалить участника
/// поиск по участникам

module.exports = {
  getAllGroups,
  getGroupById,
  addGroup,
  updateGroup,
  deleteGroup,
};

///////////////// ВАЖНО ////////////////////////////

// Используй new Event + save(), если:

//     Нужно промежуточное изменение объекта перед сохранением.
//     Требуется пошаговый контроль над процессом создания и сохранения.
//     Важна гибкость (например, добавление асинхронных вычислений до сохранения).

// Используй Event.create(), если:

//     Данные уже готовы, и объект не нужно модифицировать.
//     Нужна краткость и простота.
//     Ты хочешь минимизировать вероятность ошибок между созданием и сохранением.
