const { getAllEvents } = require("../eventsController");
const { Event } = require("../../../models/eventModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { date } = require("joi");

jest.mock("../../../models/eventModel", () => ({
  Event: {
    find: jest.fn(),
    insertMany: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    aggregate: jest.fn(),
    save: jest.fn(),
  },
}));

describe("getAllEvents Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Event.find.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getAllEvents(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Error getting events: Database error",
    });
  });

  it("должен вернуть 200 и массив тренировок", async () => {
    const mockEvents = [
      {
        _id: "1",
        groupTitle: "Title1",
        groupId: "1",
        isCancelled: false,
        // date: new Date().toISOString(),
        date: "2023-01-02",
        participants: [],
      },
      {
        _id: "2",
        groupTitle: "Title2",
        groupId: "2",
        isCancelled: false,
        //date: new Date().toISOString(),
        date: "2023-01-03",
        participants: [],
      },
    ];
    Event.find.mockResolvedValueOnce(mockEvents); // Мок успешного ответа

    const req = httpMocks.createRequest(); // Мокаем запрос
    const res = httpMocks.createResponse(); // Мокаем ответ

    await getAllEvents(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockEvents); // Проверяем, что вернулись данные
  });
  it("должен вернуть все события при успешном выполнении запроса", async () => {
    const events = [
      {
        _id: "1",
        groupTitle: "groupTitle 1",
        groupId: "1",
        isCancelled: false,
        date: new Date().toISOString(),
        participants: [],
      },
      {
        _id: "2",
        groupTitle: "groupTitle 2",
        groupId: "2",
        isCancelled: false,
        date: new Date().toISOString(),
        participants: [],
      },
    ];
    await Event.find.mockResolvedValueOnce(events);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllEvents(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toHaveLength(events.length);
    expect(JSON.parse(res._getData())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ groupTitle: "groupTitle 1" }),
        expect.objectContaining({ groupTitle: "groupTitle 2" }),
      ])
    );
  });
  it("должен вернуть пустой массив, если событий нет", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllEvents(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getData().length).toEqual(0);
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllEvents(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});
