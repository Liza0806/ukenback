const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers/handleMongooseError");
const Joi = require('joi'); // Добавь импорт Joi, если его нет

const eventSchema = new Schema({
    _id: {
        type: String, 
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    groupTitle: {
        type: String,
        required: true
    },
    groupId: {
        type: String,
        required: true
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    participants: {
        type: [{ id: String, name: String, telegramId: String }], // Массив объектов для хранения ID и имен участников
        required: true
    }
}, { timestamps: true }); // timestamps добавлены как опция схемы

const Event = model('event', eventSchema);

const participantsSchemaJoi = Joi.object({
    name: Joi.string().required(),
    id: Joi.string().required(),
    telegramId: Joi.string()
});

const addEventSchema = Joi.object({
    _id: Joi.string().required(),
    date: Joi.date().required(), // Исправлен тип
    groupTitle: Joi.string().required(),
    groupId: Joi.string().required(),
    isCancelled: Joi.boolean().default(false), // Исправлен тип
    participants: Joi.array().items(participantsSchemaJoi).default([]),
});

const schemas = {
    addEventSchema
};

module.exports = {
    Event,
    schemas
};
