const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers/handleMongooseError");


// const eventSchema = new Schema({
//     _id: {
//         type: String, 
//         required: true
//       },
//   groupId: {
//     type: Schema.Types.ObjectId,
//     ref: 'Group',
//     required: true
//   },
//   date: {
//     type: Date,
//     required: true
//   },
//   isCancelled: {
//     type: Boolean,
//     default: false
//   },
//   participants: [{
//     type: Schema.Types.ObjectId,
//     ref: 'User'
//   }]
// }, {
//   timestamps: true
// });
// const Event = model('event', eventSchema);
// const schemas = {
//     // addGroupSchema,
//     // updateGroupScheduleSchema,
//     // updateGroupPriceSchema,
//   };
// // Создаем и экспортируем модель Event

// // module.exports = Event;
// module.exports = {
//     Event,
//     schemas
//   };