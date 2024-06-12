const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { handleMongooseError } = require("../helpers/handleMongooseError");

const phoneRegexp = /^(\+\d{1,2}\s?)?(\(\d{1,4}\))?[0-9.\-\s]{6,}$/;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: { type: String, required: [true, "Set password for user"] },
    phone: {
      type: String,
      match: phoneRegexp,
    },
    isAdmin: { type: Boolean, default: false },
    group: { type: String, required: true },
    visits: { type: Number, required: true, default: 0 },
    token: {
      type: String,
    },
    avatarURL: {
      type: String,
      required: false,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false, timestamps: true }
);
userSchema.post("save", handleMongooseError);

const addVisit = Joi.object({
  visits: Joi.number().required(),
});

const registerSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  group: Joi.string().required(),
  //  .valid("children", "teens", "yung", "single")
  //  .default("children"),
});
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
