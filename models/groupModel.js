const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers/handleMongooseError");

const Joi = require("joi");

const validDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const groupSchema = new Schema({
  title: {
    type: String,
    required: [true, "Set name for the group"],
    default: "children",
  },
  payment_for_visit: {
    type: Number,
    required: true,
    default: null,
  },
  monthly_payment: {
    type: Number,
    required: true,
    default: null,
  },
  days: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.every((day) => validDays.includes(day));
      },
      message: (props) => `${props.value} is not a valid day!`,
    },
  },
  time: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: (props) => `${props.value} is not a valid time!`,
    },
  },
});

const addGroupSchema = Joi.object({
  title: Joi.string().required(),
  days: Joi.string().required(),
  time: Joi.string().valid(),
  monthly_payment: Joi.number(),
  payment_for_visit: Joi.number(),
});
const updateGroupPriceSchema = Joi.object({
  monthly_payment: Joi.number(),
  payment_for_visit: Joi.number(),
});
const updateGroupSceduleSchema = Joi.object({
  days: Joi.string().required(),
  time: Joi.string().valid(),
});

groupSchema.post("save", handleMongooseError);

const Group = model("group", groupSchema);

const schemas = {
  addGroupSchema,
  updateGroupSceduleSchema,
  updateGroupPriceSchema,
};
module.exports = {
  Group,
  schemas
};
