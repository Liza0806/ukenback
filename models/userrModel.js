const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { handleMongooseError } = require("../helpers/handleMongooseError");

const phoneRegexp = /^(\+\d{1,2}\s?)?(\(\d{1,4}\))?[0-9.\-\s]{6,}$/;
const visitSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  groupId: { type: String, required: true },
  eventId: { type: String, required: true }
});
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: [true, "Set password for user"] },
    phone: {
      type: String,
      match: phoneRegexp,
    },
    isAdmin: { type: Boolean, default: false },
    groups: { type: Array, required: true }, ///
    balance:{
      type: Number,
      default: 0
    }, 
    discount: {
      type: Number,
      default: 0
    },
    visits: [visitSchema],
    verify: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: [true, "Verify token is required"],
    },
    token: {
      type: String,
      default: null
    },
    telegramId: {
     type: Number,
     required: true
    }
  },
  { versionKey: false, timestamps: true }
);
userSchema.post("save", handleMongooseError);

const addVisit = Joi.object({
  date: Joi.date().iso().required(), // Дата в формате ISO 8601
  groupId: Joi.string().required()
});

const registerSchema = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(phoneRegexp).required(),
  groups: Joi.array().required().default([]),
  token: Joi.string().allow(null),
  telegramId: Joi.number().required(),
  balance: Joi.number().default(0)
});
 // verificationCode: Joi.string().required(),

const loginSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

const schemas = {
  registerSchema,
  loginSchema,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
