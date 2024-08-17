// const cron = require('node-cron');
// const { Group } = require('./models/group'); // Подключи свою модель Group
// const { Event } = require('./models/event'); // Подключи свою модель Event
// const moment = require('moment'); // Удобная библиотека для работы с датами

// // Задача, которая запускается 1 числа каждого месяца в полночь
// cron.schedule('0 0 1 * *', async () => {
//   try {
//     // Получаем все группы с расписанием
//     const groups = await Group.find({});

//     // Для каждой группы создаем события на следующий месяц
//     const nextMonth = moment().add(1, 'month');
//     const daysInMonth = nextMonth.daysInMonth();

//     for (const group of groups) {
//       const { schedule, _id: groupId, title: groupTitle } = group;

//       // Генерация событий на основании расписания
//       for (let day = 1; day <= daysInMonth; day++) {
//         const date = moment(`${nextMonth.year()}-${nextMonth.month() + 1}-${day}`, 'YYYY-MM-DD');

//         // Проверка, если день совпадает с днем из расписания
//         for (const scheduleEntry of schedule) {
//           if (date.format('dddd').toLowerCase() === scheduleEntry.day.toLowerCase()) {
//             const eventDate = date.set('hour', scheduleEntry.time.split(':')[0]).set('minute', scheduleEntry.time.split(':')[1]);

//             // Проверка на существование события
//             const existingEvent = await Event.findOne({ date: eventDate.toDate(), group: groupId });
//             if (!existingEvent) {
//               // Создаем новое событие
//               await Event.create({
//                 _id: `${groupId}_${eventDate.format('YYYYMMDD')}`, // Идентификатор события (можно поменять логику)
//                 date: eventDate.toDate(),
//                 group: groupId,
//                 participants: [], // Изначально без участников
//                 isCancelled: false,
//               });
//             }
//           }
//         }
//       }
//     }

//     console.log("События на следующий месяц успешно созданы.");
//   } catch (error) {
//     console.error("Ошибка при создании событий:", error);
//   }
// });


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
createEventsForCurrentMonth();

