const { Group } = require("../models/groupModel");
const { HttpError } = require("../helpers/HttpError");
const { User } = require("../models/userModel");
const { generateEventsForMonth } = require("../plans/nextMonthEvent");

/// Получить все группы
const getAllGroups = async (req, res) => {
  try {
    const data = await Group.find({});
    res.json(data); // Статус 200 по умолчанию
  } catch (error) {
    HttpError(500, `Failed to retrieve groups ${error.message}`);
  }
};

/// Получить 1 по ид
const getGroupById = async (req, res) => {
  const groupId = req.params.id; // Получаем ID из параметров запроса

  try {
    const group = await Group.findById(groupId); // Найти группу по ID

    if (!group) {
      return HttpError(404, "Group not found");
    }

    res.json(group);
  } catch (error) {
    HttpError(500, `Failed to retrieve group ${error.message}`);
  }
};
const addGroup = async (req, res) => {
  const { title, coachId, payment, schedule } = req.body;

  try {
    // Проверка валидности данных
    const isValid = isValidGroupData({ title, payment, coachId, schedule });
    if (!isValid) {
      return res.status(400).json({ message: "Invalid group data" });
    }

    // Проверка, существует ли уже группа с таким названием
    const groupExists = await isGroupAlreadyExist({ title });
    if (groupExists) {
      console.log("This title already exists");
      return res.status(400).json({ message: "This title already exists" });
    }

    // Проверка расписания
    const scheduleCheck = await isGroupScheduleSuitable(schedule);
    if (scheduleCheck) {
      console.log({ message: scheduleCheck });
      return res.status(400).json({ message: scheduleCheck });
    }
    // Создание новой группы
    const group = await Group.create({ title, coachId, payment, schedule });

    // Формирование ответа
    const {
      _id,
      title: groupTitle,
      coachId: groupCoachId,
      payment: groupPayment,
      schedule: groupSchedule,
    } = group;

    res.status(201).json({
      id: _id,
      title: groupTitle,
      coachId: groupCoachId,
      payment: groupPayment,
      schedule: groupSchedule,
    });
  } catch (err) {
    console.error("Error adding group:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const isValidGroupData = ({ title, payment, coachId, schedule }) => {
  // Более строгие проверки можно добавить здесь
  return (
    typeof title === "string" &&
    typeof coachId === "string" &&
    Array.isArray(payment) &&
    payment.every(p => typeof p === 'object' && p !== null) && // Пример проверки для payment
    Array.isArray(schedule) &&
    schedule.every(s => typeof s.day === 'string' && typeof s.time === 'string') // Пример проверки для schedule
  );
};

const isGroupAlreadyExist = async ({ title }) => {
  try {
    const group = await Group.findOne({ title });
    return group !== null;
  } catch (error) {
    console.error("Error in isGroupAlreadyExist function:", error);
    return res.status(400).json({ message: "This title already exists" });
  }
};

const isGroupScheduleSuitable = async (schedule) => {
  try {
    const groups = await Group.find({
      'schedule': {
        $elemMatch: {
          day: { $in: schedule.map(s => s.day) },
          time: { $in: schedule.map(s => s.time) }
        }
      }
    }).exec();

    if (groups.length > 0) {
      for (const group of groups) {
        for (const existingSchedule of group.schedule) {
          for (const newSchedule of schedule) {
            if (existingSchedule.day === newSchedule.day && existingSchedule.time === newSchedule.time) {
              // Возвращаем сообщение об ошибке с указанием объекта
              return `Conflict detected: ${JSON.stringify(newSchedule)} exists in group '${group.title}'`;
            }
          }
        }
      }
    }
    return null;

  } catch (error) {
    console.error("Error in isGroupScheduleSuitable function:", error);
    throw new Error("Error checking schedule suitability");
  }
};

const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Валидируем данные, полученные от клиента
    isValidGroupData({ title, coachId, payment, schedule });

    if (!isValidGroupData({ title, coachId, payment, schedule })) {
      return res.status(400).json({ message: "Invalid group data" });
    }
    // Ищем группу и обновляем её
    const updatedGroup = await Group.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // Если группа не найдена, возвращаем ошибку
    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Возвращаем обновленные данные группы
    res.status(200).json(updatedGroup);
  } catch (err) {
    // Логируем и возвращаем ошибку
    handleError(err, res);
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params; // Получаем ID группы из параметров маршрута

    // Ищем и удаляем группу по ID
    const deletedGroup = await Group.findByIdAndDelete(id);

    // Если группа не найдена, возвращаем ошибку
    if (!deletedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Возвращаем сообщение об успешном удалении
    res.status(200).json({ message: "Group successfully deleted" });
  } catch (err) {
    // Логируем и возвращаем ошибку
    handleError(err, res);
  }
};

/// добавить участника и удалить участника
/// поиск по участникам

module.exports = {
  getAllGroups,
  getGroupById,
  addGroup,
  updateGroup,
  deleteGroup
};
