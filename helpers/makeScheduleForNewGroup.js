const mongoose = require("mongoose");
const makeScheduleForNewGroup = (scheduleFromGroup, currentDate, endOfMonth, title, groupId) => {
    const events = [];
    
    scheduleFromGroup.forEach(({ day, time }) => {
      const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
      if (dayIndex === -1) return;
  
      let date = new Date(currentDate);
      date.setUTCDate(date.getUTCDate() + ((dayIndex - date.getUTCDay() + 7) % 7)); // Устанавливаем правильный день недели
  
      while (date <= endOfMonth) {
        const [hours, minutes] = time.split(":").map(Number);
        date.setUTCHours(hours, minutes, 0, 0); // Устанавливаем время в UTC
  
        events.push({
          _id: new mongoose.Types.ObjectId().toString(),
          date: date.toISOString(),
          groupTitle: title,
          groupId,
          participants: [],
        });
  
        date.setUTCDate(date.getUTCDate() + 7); // Переход на следующую неделю
      }
    });
  
    return events;
  };
  
  
  module.exports = {
    makeScheduleForNewGroup
  }