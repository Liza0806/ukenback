const { User } = require("../models/userrModel");
const { HttpError } = require("../helpers/HttpError");

const getAllUsers = async (req, res) => {
 const users = await User.find({})
 if (!users || users.length === 0) {
  return [];
}
res.json(users)
}
 
const getUserById = async (req, res) => {
  const { id } = req.params; 
  try {
  const user = await User.find({_id: id})
  if (!user) {
    HttpError(404, 'Group not found')
  }
  res.json(user);
}
  catch (error) {
    HttpError(500, `Failed to retrieve user ${error.message}`)
  }
  
}

async function removeUser(id) {
  // const result = await User.findByIdAndDelete(id);
  // return result;
}

async function addVisit(id) {
    // const result = await Group.findByIdAndUpdate(id, req, { new: true });
    // if (!result) {
    //   throw HttpError(404, "not found");
    // }
    // return result;
  }
// const addVisitJ = Joi.object({
//     // visits: Joi.number().required(),
//   });
module.exports = {
  getAllUsers,
    getUserById,
    removeUser,
    addVisit
}