const mongoose = require("mongoose");
const makeScheduleForNewGroup = (scheduleFromGroup, currentDate, endOfMonth, title, groupId) => {
    const events = [];
    debugger
    scheduleFromGroup.forEach(({ day, time }) => {
      const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
      if (dayIndex === -1) return;
      debugger
      let date = new Date(currentDate);
      date.setUTCDate(date.getUTCDate() + ((dayIndex - date.getUTCDay() + 7) % 7)); // Устанавливаем правильный день недели
      debugger
      while (date <= endOfMonth) {
        const [hours, minutes] = time.split(":").map(Number);
        date.setUTCHours(hours, minutes, 0, 0); // Устанавливаем время в UTC
        debugger
        events.push({
          _id: new mongoose.Types.ObjectId().toString(),
          date: date.toISOString(),
          groupTitle: title,
          groupId,
          participants: [],
        });
        debugger
        date.setUTCDate(date.getUTCDate() + 7); // Переход на следующую неделю
      }
    });
  console.log(events, 'events in makeScheduleForNewGroup')
    return events;
  };
  
  
  module.exports = {
    makeScheduleForNewGroup
  }