const cron = require("node-cron");
const moment = require("moment");
const { Group } = require("../models/groupModel");
const { nanoid } = require("nanoid");

// Функция для генерации событий
const generateEventsForMonth = async () => {
  const groups = await Group.find({});

  for (const group of groups) {
    const schedule = group.schedule;

    // const startOfMonth = moment().startOf('month');
    // const endOfMonth = moment().endOf('month');
    // (let day = startOfMonth; day.isBefore(endOfMonth); day.add(1, 'day'))
    // (let day = startOfNextMonth; day.isBefore(endOfNextMonth); day.add(1, 'day'))

    const startOfNextMonth = moment().add(1, "month").startOf("month");
    const endOfNextMonth = moment().add(1, "month").endOf("month");
    const events = [];

    // Перебираем каждый день месяца
    for (
      let day = startOfNextMonth;
      day.isBefore(endOfNextMonth);
      day.add(1, "day")
    ) {
      schedule.forEach((s) => {
        if (day.format("dddd") === s.day) {
          events.push({
            _id: nanoid(),
            date: day
              .clone()
              .hour(parseInt(s.time.split(":")[0]))
              .minute(parseInt(s.time.split(":")[1]))
              .toDate(),
            isCancelled: false,
            participants: [],
          });
        }
      });
    }

    // Обновляем группу с новыми событиями
    group.events = [...group.events, ...events];
    await group.save();
  }

  console.log("Events generated for the month");
};
// Планируем задачу на первое число каждого месяца в 00:00
cron.schedule("0 0 1 * *", generateEventsForMonth);
