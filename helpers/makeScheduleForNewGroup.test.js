const {makeScheduleForNewGroup} = require("./makeScheduleForNewGroup"); 

describe("makeScheduleForNewGroup", () => {
  const currentDate = new Date("2024-12-01T00:00:00.000Z");
  const endOfMonth = new Date("2024-12-31T23:59:59.999Z");
  const groupId = "testGroupId";
  const title = "Test Group";

  it("should generate events for a valid schedule", () => {
    debugger
    const schedule = [
      { day: "  Понеділок", time: "10:00" },
      { day: "Середа", time: "15:30" },
    ];
    debugger
    const events = makeScheduleForNewGroup(schedule, currentDate, endOfMonth, title, groupId);
    debugger
    expect(events.length).toBeGreaterThan(0);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          groupId,
          groupTitle: title,
          participants: [],
        }),
      ])
    );
  });

  it("should handle an empty schedule", () => {
    const schedule = [];
    const events = makeScheduleForNewGroup(schedule, currentDate, endOfMonth, title, groupId);
    expect(events).toHaveLength(0);
  });

  it("should ignore invalid days", () => {
    const schedule = [{ day: "Notaday", time: "10:00" }];
    const events = makeScheduleForNewGroup(schedule, currentDate, endOfMonth, title, groupId);
    expect(events).toHaveLength(0);
  });

  it("should handle overlapping dates correctly", () => {
    const schedule = [{ day: "Неділя", time: "12:00" }];

    const events = makeScheduleForNewGroup(schedule, currentDate, endOfMonth, title, groupId);

    expect(events[0].date).toBe("2024-12-01T12:00:00.000Z");
    expect(events[events.length - 1].date).toBe("2024-12-29T12:00:00.000Z");
  });

  it("should correctly parse time and set hours and minutes", () => {
    const schedule = [{ day: "Вівторок", time: "09:45" }];

    const events = makeScheduleForNewGroup(schedule, currentDate, endOfMonth, title, groupId);
    const eventDate = new Date(events[0].date);

    expect(eventDate.getUTCHours()).toBe(9);
    expect(eventDate.getUTCMinutes()).toBe(45);
  });

  it("should generate events for multiple days of the week", () => {
    const schedule = [
      { day: "  Понеділок", time: "10:00" },
      { day: "П'ятниця", time: "18:00" },
    ];

    const events = makeScheduleForNewGroup(schedule, currentDate, endOfMonth, title, groupId);
console.log(events)
    const   ПонеділокEvents = events.filter((e) => new Date(e.date).getUTCDay() === 1); //   Понеділок is 1
    const П'ятницяEvents = events.filter((e) => new Date(e.date).getUTCDay() === 5); // П'ятниця is 5

    expect(  ПонеділокEvents.length).toBeGreaterThan(0);
    expect(П'ятницяEvents.length).toBeGreaterThan(0);
  });
});
