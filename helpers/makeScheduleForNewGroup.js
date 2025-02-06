const mongoose = require("mongoose");

const makeScheduleForNewGroup = (scheduleFromGroup, currentDate, endOfMonth, title, groupId) => {
  const events = [];

  scheduleFromGroup.forEach(({ day, time }) => {
    const dayIndex = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота", "Неділя"].indexOf(day) +1;
    console.log(dayIndex, '-dayIndex')
    if (dayIndex === -1) return;
debugger
    let date = new Date(currentDate);

    console.log(date, '-date', currentDate, '-currentDate')

const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    // Разница между текущим днем (UTC) и нужным днем недели
    let diff = (dayIndex - localDate.getUTCDay() + 7) % 7;
    if (diff === 0 && localDate.getUTCHours() >= 23) { 
      // Если сегодня нужный день, но время уже позднее
      diff = 7;
    }
    console.log(localDate, '-localDate')
    // **Добавляем смещение, чтобы избежать перехода на предыдущий день**
    localDate.setUTCDate(localDate.getUTCDate() + diff);
    console.log(endOfMonth, '-endOfMonth')


  
    while (date <= endOfMonth) {
      if (events.length > 1000) {  // Ограничение на кол-во событий
        console.warn("Превышен лимит событий. Возможно, есть ошибка.");
        break;
      }

      const [hours, minutes] = time.split(":").map(Number);
      const eventDate = new Date(Date.UTC(
        localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getUTCDate(),
        hours,
        minutes
      ));

      if (eventDate > endOfMonth) break; // Выход из цикла, если дата выходит за пределы месяца

      events.push({
        _id: new mongoose.Types.ObjectId().toString(),
        date: eventDate.toISOString(),
        groupTitle: title,
        groupId,
        participants: [],
      });

      localDate.setUTCDate(localDate.getUTCDate() + 7);
    }
  });

  return events;
};

module.exports= {
  makeScheduleForNewGroup
}