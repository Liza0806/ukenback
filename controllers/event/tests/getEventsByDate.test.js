const { getEventsByDate } = require("../eventsController");
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
describe("getEventsByDate Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Event.aggregate.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
      query: {
        startDate: "2023-01-01",
        endDate: "2023-01-04",
      },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getEventsByDate(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Error getting events: Database error",
    });
  });
  it("должен вернуть 400, если startDate отсутствует", async () => {
    const req = httpMocks.createRequest({
      query: {
        endDate: "2023-01-04", // Только endDate, startDate отсутствует
      },
    });
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getEventsByDate(req, res);

    // Проверяем, что статус 400
    expect(res.statusCode).toBe(400);

    // Проверяем сообщение об ошибке
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: "Both startDate and endDate are required.",
    });
  });
  it("должен вернуть 400, если endDate отсутствует", async () => {
    const req = httpMocks.createRequest({
      query: {
        startDate: "2023-01-01", // Только startDate, endDate отсутствует
      },
    });
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getEventsByDate(req, res);

    // Проверяем, что статус 400
    expect(res.statusCode).toBe(400);

    // Проверяем сообщение об ошибке
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: "Both startDate and endDate are required.",
    });
  });

  it("должен вернуть 200 и тренировки", async () => {
    const mockEvent = [
      {
        _id: "1",
        groupTitle: "Title1",
        groupId: "1",
        isCancelled: false,
        date: "2023-01-02",
        participants: [],
      },
    ];

    // Мок успешного ответа
    Event.aggregate.mockResolvedValueOnce(mockEvent);

    const req = httpMocks.createRequest({
      query: {
        startDate: "2023-01-01",
        endDate: "2023-01-04",
      },
    });
    const res = httpMocks.createResponse();

    // Вызов правильного обработчика
    await getEventsByDate(req, res);
    // console.log(res, 'res in getEventsByDate')
    // Проверяем, что статус ответа 200
    expect(res.statusCode).toBe(200);

    // Проверяем, что вернулись правильные данные
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual(mockEvent);
    expect(Event.aggregate).toHaveBeenCalledWith([
      {
        $addFields: {
          dateAsDate: { $toDate: "$date" },
        },
      },
      {
        $match: {
          dateAsDate: {
            $gte: new Date("2023-01-01"),
            $lt: new Date("2023-01-04"),
          },
        },
      },
    ]);
  });
});
