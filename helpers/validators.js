const { Group } = require("../models/groupModel");

const validateData = (schema, data) => {
  debugger
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      debugger
      throw new Error(`Validation error: ${error.details.map((d) => d.message).join(", ")}`);
    }
    return value;
  };
  

  ////////////// GROUP//////////////////

  const isValidGroupData = ({ title, payment, coachId, schedule, participants }) => {
    console.log("Validating data:", { title, payment, coachId, schedule, participants }); 
    debugger
    return (
      typeof title === "string" &&
      typeof coachId === "string" &&
      Array.isArray(payment) &&
      payment.every((p) => typeof p === "object" && p !== null) && // Пример проверки для payment
      Array.isArray(schedule) &&
      schedule.every(
        (s) => typeof s.day === "string" && typeof s.time === "string"
      ) && Array.isArray(participants) 
    );
  };

  const isGroupAlreadyExist = async ({ title }) => {
    debugger
    try {
      debugger
      const group = await Group.findOne({ title });
      return group !== null; // Возвращаем true, если группа существует
    } catch (error) {
      debugger
      console.error("Error in isGroupAlreadyExist function:", error);
      throw new Error("Failed to check if group exists");
    }
  };
  

  const isGroupScheduleSuitable = async (schedule) => {
    try {
      const groups = await Group.find({
        schedule: {
          $elemMatch: {
            day: { $in: schedule.map((s) => s.day) },
            time: { $in: schedule.map((s) => s.time) },
          },
        },
      }).exec(); // Ensure this is correctly called
      console.log(groups, 'groups')
  
      if (groups.length > 0) {
        for (const group of groups) {
          for (const existingSchedule of group.schedule) {
            for (const newSchedule of schedule) {
              if (
                existingSchedule.day === newSchedule.day &&
                existingSchedule.time === newSchedule.time
              ) {
                // Return conflict message
                return `Conflict detected: ${JSON.stringify(newSchedule)} exists in group '${group.title}'`;
              }
            }
          }
        }
      }
  debugger
      return null;
    } catch (error) {
      debugger
      console.error("Error in isGroupScheduleSuitable function:", error);
      throw new Error(`Error checking schedule suitability: ${error.message}`);
    }
  };

  module.exports = {
    validateData,
    isGroupScheduleSuitable,
    isGroupAlreadyExist,
    isValidGroupData,
  }