const { User } = require("../models/userrModel");
const { HttpError } = require("../helpers/HttpError");


async function getUserById(id) {
  // const result = await User.findOne({ _id: id });
  // return result;
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
    getUserById,
    removeUser,
    addVisit
}