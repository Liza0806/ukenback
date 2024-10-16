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

const scheduleSchema = new Schema({
  day: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  _id: {
    type: String
  }
});

const participantsSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  telegramId: {
    type: Number,
    required: true,
  },
});

const paymentSchema = new Schema ({
  dailyPayment: {
    type: Number,
    required: false,
    default: 0
  },
  monthlyPayment: {
    type: Number,
    required: false,
    default: 0
  },
  _id: {
    type: String,
    required: false
  }
})

const groupSchema = new Schema({
  // _id: {
  //   type: String,
  //   required: false
  // },
  title: {
    type: String,
    required: [true, "Set name for the group"],
    default: "newGroupTitle",
  },
  coachId: {
    type: String,
    default: "Kostya"
  },
payment: [paymentSchema],
schedule: [scheduleSchema],
participants: [participantsSchema],
});

const scheduleSchemaJoi = Joi.object({
  day: Joi.string().required(),
  time: Joi.string().required(),
  _id: Joi.string()
});
const paymentSchemaJoi = Joi.object({
  dailyPayment: Joi.number().allow('').default('0'),
  monthlyPayment: Joi.number().allow('').default('0'),
  _id: Joi.string()
});

const participantsSchemaJoi = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  telegramId: Joi.number().required(),
})
const addGroupSchema = Joi.object({
  // _id: Joi.string(),
  title: Joi.string().default('newGroupTitle'),
  coachId: Joi.string().default('Kostya'),
  payment: Joi.array().items(paymentSchemaJoi).default([]),
  schedule: Joi.array().items(scheduleSchemaJoi).default([]),
  participants: Joi.array().items(participantsSchemaJoi).default([]),
});

const updateGroupPriceSchema = Joi.object({
  payment: Joi.array().items(paymentSchemaJoi).default([]),
});

const updateGroupparticipantsSchema = Joi.object({
  participants: Joi.array().items(participantsSchemaJoi).default([]),
})

const updateGroupScheduleSchema = Joi.object({
  schedule: Joi.array().items(scheduleSchemaJoi).default([]),
});

groupSchema.post("save", handleMongooseError);

const Group = model("group", groupSchema);

const schemas = {
  addGroupSchema,
  updateGroupScheduleSchema,
  updateGroupPriceSchema,
};

module.exports = {
  Group,
  schemas
};
