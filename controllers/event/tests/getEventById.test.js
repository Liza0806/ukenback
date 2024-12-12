const { getEventById } = require("../eventsController");
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

describe("getEventById Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Event.findById.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getEventById(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Error getting event: Database error",
    });
  });

  it("должен вернуть 200 и тренировку", async () => {
    const mockEvent = {
      _id: "1",
      groupTitle: "Title1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    await Event.findById.mockResolvedValueOnce(mockEvent); // Мок успешного ответа

    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockEvent); // Проверяем, что вернулись данные
  });
  it("должен вернуть событие при успешном выполнении запроса", async () => {
    const event = {
      _id: "1",
      groupTitle: "groupTitle 1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    await Event.findById.mockResolvedValueOnce(event);

    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ groupTitle: "groupTitle 1" }) // Проверяем, что объект содержит нужное поле
    );
  });

  it("должен вернуть пустой массив, если события нет", async () => {
    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.statusCode).toBe(404);
    // console.log(res._getData())
    expect(res._getJSONData()).toEqual({ message: "Event not found" });
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});
