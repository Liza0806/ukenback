const cron = require('node-cron');
const { Group } = require('./models/groupModel'); 
const { Event } = require('./models/eventModel'); 
const moment = require('moment');

// Функция для создания событий с текущей даты до конца месяца
async function createEventsForCurrentMonth() {
  try {
    // Получаем все группы с расписанием
    const groups = await Group.find({});
console.log(groups, 'groups')
    // Берем текущую дату и считаем количество дней до конца следующего месяца
    const today = moment().add(0, 'month');
    const daysInMonth = today.daysInMonth();

    for (const group of groups) {
      const { schedule, _id: groupId } = group;
      console.log(group, 'group')
      // Генерация событий для оставшихся дней месяца
      for (let day = today.date(); day <= daysInMonth; day++) {
        const date = moment(`${today.year()}-${today.month() + 1}-${day}`, 'YYYY-MM-DD');

        // Проверка, если день совпадает с днем из расписания
        for (const scheduleEntry of schedule) {
          if (date.format('dddd').toLowerCase() === scheduleEntry.day.toLowerCase()) {
            const eventDate = date.set('hour', scheduleEntry.time.split(':')[0]).set('minute', scheduleEntry.time.split(':')[1]);

            // Проверка на существование события
            const existingEvent = await Event.findOne({ date: eventDate.toDate(), group: groupId });
            if (!existingEvent) {

              // Создаем новое событие
              await Event.create({
                _id: `${groupId}_${eventDate.format('YYYYMMDD')}`, // Идентификатор события
                date: eventDate.toDate(),
                group: groupId,
                participants: [], // Изначально без участников
                isCancelled: false,
              });
            }
          }
        }
      }
    }

    console.log("События до конца текущего месяца успешно созданы.");
  } catch (error) {
    console.error("Ошибка при создании событий:", error);
  }
}

// Запуск задачи немедленно при старте приложения


module.exports = {
  createEventsForCurrentMonth,
};