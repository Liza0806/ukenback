const cron = require('node-cron');
const { Group } = require('./models/groupModel'); 
const { Event } = require('./models/eventModel'); 
const moment = require('moment');
require('moment/locale/uk'); // Импорт локали
moment.locale('uk');
// // Функция для создания событий с текущей даты до конца месяца
// async function createEventsForCurrentMonth() {
//   try {
//     // Получаем все группы с расписанием
//     const groups = await Group.find({});
// console.log(groups, 'groups')
//     // Берем текущую дату и считаем количество дней до конца следующего месяца
//     const today = moment().add(4, 'month');
//     const daysInMonth = today.daysInMonth();

//     for (const group of groups) {
//       const { schedule, _id: groupId } = group;
//       console.log(group, 'group')
//       // Генерация событий для оставшихся дней месяца
//       for (let day = today.date(); day <= daysInMonth; day++) {
//         const date = moment(`${today.year()}-${today.month() + 1}-${day}`, 'YYYY-MM-DD');

//         // Проверка, если день совпадает с днем из расписания
//         for (const scheduleEntry of schedule) {
//           if (date.format('dddd').toLowerCase() === scheduleEntry.day.toLowerCase()) {
//             const eventDate = date.set('hour', scheduleEntry.time.split(':')[0]).set('minute', scheduleEntry.time.split(':')[1]);

//             // Проверка на существование события
//             const existingEvent = await Event.findOne({ date: eventDate.toDate(), group: groupId });
//             if (!existingEvent) {

//               // Создаем новое событие
//               await Event.create({
//                 _id: `${groupId}_${eventDate.format('YYYYMMDD')}`, // Идентификатор события
//                 date: eventDate.toISOString(),
//                 groupTitle: group.title,
//                 groupId: group._id,
//                 participants: [], // Изначально без участников
//                 isCancelled: false,
//               });
//             }
//           }
//         }
//       }
//     }

//     console.log("События до конца текущего месяца успешно созданы.");
//   } catch (error) {
//     console.error("Ошибка при создании событий:", error);
//   }
// }

// Запуск задачи немедленно при старте приложения

// Функция для создания событий с первого числа следующего месяца до его конца
// Функция для создания событий с первого числа следующего месяца до его конца
// Функция для создания событий с первого числа следующего месяца до его конца
// Функция для создания событий с первого числа следующего месяца до его конца

async function createEventsForNextMonth() {
  try {
    const groups = await Group.find({});
    const today = moment();
    const firstDayOfNextMonth = today.clone().add(0, 'month').startOf('month');
    const lastDayOfNextMonth = today.clone().add(0, 'month').endOf('month');

    for (const group of groups) {
      const { schedule, _id: groupId } = group;

      for (let day = firstDayOfNextMonth.date(); day <= lastDayOfNextMonth.date(); day++) {
        const eventDate = firstDayOfNextMonth.clone().date(day);

        for (const scheduleEntry of schedule) {
          if (eventDate.format('dddd').toLowerCase() === scheduleEntry.day.toLowerCase()) {
            const timeParts = scheduleEntry.time.split(':');

            // Validate time format
            if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
              console.error(`Неверное значение времени: ${scheduleEntry.time}`);
              continue;
            }

            const eventDateWithTime = eventDate.clone().set('hour', parseInt(timeParts[0], 10)).set('minute', parseInt(timeParts[1], 10));

            if (!eventDateWithTime.isValid()) {
              console.error(`eventDateWithTime is not a valid moment object: ${eventDateWithTime.format()}`);
              continue; // Skip invalid date
            }

            const existingEvent = await Event.findOne({ date: eventDateWithTime.toDate(), group: groupId });

            // If event doesn't exist, create it
            if (!existingEvent) {
              await Event.create({
                _id: `${groupId}_${eventDateWithTime.format('YYYYMMDD')}`,
                date: eventDateWithTime.toISOString(),
                groupTitle: group.title,
                groupId: groupId,
                participants: [],
                isCancelled: false,
              });
            }
          }
        }
      }
    }

    console.log("События для следующего месяца успешно созданы.");
  } catch (error) {
    console.error("Ошибка при создании событий:", error);
  }
}

// Export the function
module.exports = {
  createEventsForNextMonth,
};