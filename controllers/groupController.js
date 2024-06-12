const { Group } = require("../models/groupModel");
const { HttpError } = require("../helpers/HttpError");

async function getAllGroups(req, res) {
  try {
    const data = await Group.find({});
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
}

async function getGroupById(id) {
  const result = await Group.findOne({ _id: id });
  return result;
}

async function updateGroup(id, req) {
  const result = await Group.findByIdAndUpdate(id, req, { new: true });
  if (!result) {
    throw HttpError(404, "not found");
  }
  return result;
}

async function addGroup(req) {
  const newGroup = await Group.create({ ...req.body });
  return newContact;
}

module.exports = {
  addGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
};
