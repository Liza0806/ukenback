const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require("path")
const fs = require("fs/promises")
const {nanoid} = require("nanoid")

const { User } = require('../models/userrModel');
const {HttpError } = require('../helpers/HttpError')
const ctrlWrapper = require('../helpers/ctrlWrapper')
const sendEmail = require("../helpers/sendEmail")

const gravatar = require("gravatar");
const avatarDir = path.join(__dirname, "../", "public", "avatars")

require('dotenv').config();
const {SECRET_KEY} = process.env;
const {BASE_URL} = process.env;

const register = async (req, res) => {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email }); 
    if (userExists) {
        throw HttpError(409, 'User already exists');
      }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email)
    const verificationCode = nanoid()
    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, groups, verificationCode });
    console.log(verificationCode)
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/auth/verify/${verificationCode}">Click verify email</a>`
  };
  await sendEmail(verifyEmail);

    res.status(201).json({
 
name: newUser.name,
email: newUser.email,
password: newUser.password,
groups: newUser.groups, 
phone: newUser.phone,
    });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, 'Email or password is wrong');
    }
  
    const token = jwt.sign({
      id: user._id,
    }, SECRET_KEY, { expiresIn: '23h' });
    await User.findByIdAndUpdate(user._id, { token });
   console.log(token,'token')
    res.json({token})
}

  const getCurrent = async (req, res) => {
    const { email } = req.user;
    res.json({ email });
  };

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: '' });
    res.status(204).json({ message: 'No Content' });
  };

module.exports = {
    register: ctrlWrapper(register),
    getCurrent: ctrlWrapper(getCurrent),
    login: ctrlWrapper(login),
    logout: ctrlWrapper(logout),
  };