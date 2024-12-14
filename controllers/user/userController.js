const { User, schemas } = require("../../models/userModel");
const { HttpError } = require("../../helpers/HttpError");
const { validateData } = require("../../helpers/validators");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try{
    const users = await User.find({});
    res.json(users);
  }
  catch (error) {
    console.error(error, "error");
    res.status(500).json({ message: `Error getting users: ${error.message}` });
  
  }
  };
 
const getUserByUserId = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    return res.status(500).json({ message: `Error getting user: ${error.message}` });
  }
};

// const searchUsersByName = async (req, res) => {
//   const { name } = req.query;
//   if (!name) {
//     return res.status(400).json({ message: "Name query parameter is required" });
//   }
//   try {
//     const user = await User.find({
//       name: { $regex: name, $options: "i" }
//     });
//     if (!user) {
//       HttpError(404, "Group not found");
//     }
//     res.json(user);
//   } catch (error) {
//     HttpError(500, `Failed to retrieve user ${error.message}`);
//   }
// };
const searchUsersByName = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ message: "Name query parameter is required" });
  }
  try {
    const users = await User.find({
      name: { $regex: name, $options: "i" }
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    console.error('Failed to retrieve user:', error.message);
    return res.status(500).json({ message: `Error getting user: ${error.message}` });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { _id, name, phone, groups, balance, telegramId, password, discount, isAdmin, visits } = req.body;

    const updateData = { _id, name, phone, groups, balance, telegramId, password, discount, isAdmin, visits };

    // Валидация данных
    const validatedData = validateData(schemas.updateSchema, updateData);

    // Хэширование пароля, если он валиден
    if (password && typeof password === "string" && password.length > 6) {
      updateData.password = await bcrypt.hash(password, 10);
    } else {
      throw new Error("Invalid password");
    }

    // Поиск и обновление пользователя
    const updatedUser = await User.findByIdAndUpdate(userId, validatedData, { new: true });

    // Проверка, если пользователь не найден
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Успешный ответ
    res.status(200).json({
      _id: updatedUser._id,
      discount: updatedUser.discount,
      isAdmin: updatedUser.isAdmin,
      visits: updatedUser.visits,
      name: updatedUser.name,
      phone: updatedUser.phone,
      groups: updatedUser.groups,
      balance: updatedUser.balance,
      telegramId: updatedUser.telegramId,
      verify: updatedUser.verify,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    if (error.message.startsWith("Validation error")) {
      res.status(400).json({ message: error.message });
    } else if (error.message === "Invalid password") {
      res.status(400).json({ message: error.message });
    } else {
      console.error("Error during user update:", error);
      res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
  }
};



const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    next(error);
  }
};

const addVisit = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const newVisit = {
      date: req.body.date,
      groupId: req.body.groupId,
      eventId: req.body.eventId,
    };

    user.visits.push(newVisit);

    await user.save();

    res.status(201).json(user.visits);
  } catch (error) {
    next(error);
  }
};

// {
//   "date": "2024-08-19T08:11:00.000Z",
//   "groupId": "group2",
//   "eventId": "yzlX33MxSxSJGDHjo09G7"
// }

const updateUserBalance = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { balance } = req.body;
    if (balance === undefined || typeof balance !== "number") {
      throw new BadRequestError("Invalid balance value");
    }

    user.balance = balance;

    await user.save();

    res
      .status(200)
      .json({ message: "Balance updated successfully", balance: user.balance });
  } catch (error) {
    next(error);
  }
};

// {
//   "balance": 150
// }

const getUserGroups = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userGroups = user.groups;

    res.status(200).json(userGroups);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserByUserId,
  updateUser,
  deleteUser,
  addVisit,
  updateUserBalance,
  getUserGroups,
  searchUsersByName,
};
