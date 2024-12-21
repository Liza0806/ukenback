const { User, schemas } = require("../../models/userModel");
const { HttpError } = require("../../helpers/HttpError");
const { validateData } = require("../../helpers/validators");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error(error, "error");
    res.status(500).json({ message: `Error getting users: ${error.message}` });
  }
};

const getUserByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "Id is required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error getting user: ${error.message}` });
  }
};

// const getUsersByName = async (req, res) => {
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
const getUsersByName = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res
      .status(400)
      .json({ message: "Name query parameter is required" });
  }
  try {
    const users = await User.find({
      name: { $regex: name, $options: "i" },
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    console.error("Failed to retrieve user:", error.message);
    return res
      .status(500)
      .json({ message: `Error getting user: ${error.message}` });
  }
};

const updateUser = async (req, res) => {
  debugger
  try {
    const { userId } = req.params;
    const {
      name,
      phone,
      groups,
      balance,
      telegramId,
      password,
      discount,
      isAdmin,
      visits,
    } = req.body;
    debugger
    const updateData = {
      _id: userId,
      name,
      phone,
      groups,
      balance,
      telegramId,
      password,
      discount,
      isAdmin,
      visits,
    };

    // Валидация данных
    debugger
    const validatedData = validateData(schemas.updateSchema, updateData);
    debugger
    // Хэширование пароля, если он валиден
    if (password && typeof password === "string" && password.length > 6) {
      debugger
      updateData.password = await bcrypt.hash(password, 10);
    } else {
      debugger
      throw new Error("Invalid password");
    }
debugger
    // Поиск и обновление пользователя
    const updatedUser = await User.findByIdAndUpdate(userId, validatedData, {
      new: true,
    });

    // Проверка, если пользователь не найден
    if (!updatedUser) {
      debugger
      res.status(404).json({ message: "User not found" });
      return;
    }
    debugger
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
    debugger
    if (error.message.startsWith("Validation error")) {
      debugger
      res.status(400).json({ message: error.message });
    } else if (error.message === "Invalid password") {
      debugger
      res.status(400).json({ message: error.message });
    } else {
      debugger
      console.error("Error during user update:", error);
      res
        .status(500)
        .json({ message: `Internal Server Error: ${error.message}` });
    }
  }
};

const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  if(!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User successfully deleted" });  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

const addVisit = async (req, res, next) => {
  const { userId } = req.params;
  if(!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};

// {
//   "date": "2024-08-19T08:11:00.000Z",
//   "groupId": "group2",
//   "eventId": "yzlX33MxSxSJGDHjo09G7"
// }

const updateUserBalance = async (req, res, next) => {
  const { userId } = req.params;
  if(!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { balance } = req.body;
    if (balance === undefined || typeof balance !== "number") {
      throw new Error("Invalid balance value");
    }

    user.balance = balance;

    await user.save();

    res
      .status(200)
      .json({ message: "Balance updated successfully", balance: user.balance });
  } catch (error) {
    return res
    .status(500)
    .json({ message: `Internal Server Error: ${error.message}` });
  }
};

// {
//   "balance": 150
// }

const getUserGroups = async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userGroups = user.groups || [];
    if (userGroups.length === 0) {
      return res.status(200).json({ message: "This user has no groups" });
    }

    return res.status(200).json(userGroups);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};


const addUser = async (req, res) => {
  const {
    name,
    phone,
    groups,
    balance,
    telegramId,
    password,
    discount,
    isAdmin,
    visits,
  } = req.body;

  try {
    // Формирование данных для регистрации
    const registerData = {
      name,
      phone,
      groups,
      balance,
      telegramId,
      password,
      discount,
      isAdmin,
      visits,
    };

    // Валидация данных
    const validatedData = validateData(schemas.registerSchema, registerData);

    // Хэширование пароля
    if (password && typeof password === "string") {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      validatedData.password = await bcrypt.hash(password, 10);
    } else {
      throw new Error("Invalid password");
    }

    // Создание нового пользователя
    const newUser = await User.create(validatedData);

    // Успешный ответ
    res.status(201).json({
      _id: newUser._id,
      discount: newUser.discount,
      isAdmin: newUser.isAdmin,
      visits: newUser.visits,
      name: newUser.name,
      phone: newUser.phone,
      groups: newUser.groups,
      balance: newUser.balance,
      telegramId: newUser.telegramId,
    });
  } catch (error) {
    if (error.message.startsWith("Validation error")) {
      res.status(400).json({ message: error.message });
    } else if (error.message === "Invalid password") {
      res.status(400).json({ message: error.message });
    } else {
      console.error("Error during user creation:", error);
      res
        .status(500)
        .json({ message: `Internal Server Error: ${error.message}` });
    }
  }
};

module.exports = {
  getAllUsers, //
  getUserByUserId, //
  getUsersByName, //
  getUserGroups, //
  updateUser, //
  addUser, //
  addVisit, //
  updateUserBalance,
  deleteUser, //
};
