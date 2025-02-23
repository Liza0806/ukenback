const cron = require('node-cron');
const { Group } = require('./models/groupModel'); 
const { User } = require('./models/userModel'); 
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
const updateUserActivity = async () => {
  try {
    const currentDate = new Date();
    const oneMonthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

    // Найдем пользователей, которые не были проверены в последние 7 дней
    const users = await User.find({
      "visits.date": { $lt: oneMonthAgo.toISOString() },  
    });

    for (const user of users) {
      // Проверим последний визит пользователя
      const lastVisitDate = user.visits.reduce((latest, visit) => 
        new Date(visit.date) > latest ? new Date(visit.date) : latest, new Date(0));

      if (lastVisitDate < oneMonthAgo) {
        user.isActive = false;  // Устанавливаем isActive в false, если визит был более месяца назад
      } else {
        user.isActive = true;  
      }

     await Promise.all(users.map(user => user.save()));
    }

    console.log("Обновление активности пользователей завершено.");
  } catch (error) {
    console.error("Ошибка при обновлении активности пользователей: ", error);
  }
};
// Запускать каждое воскресенье в полночь
cron.schedule('0 0 * * 0', updateUserActivity);  

// Export the function
module.exports = {
  createEventsForNextMonth,
  updateUserActivity
};