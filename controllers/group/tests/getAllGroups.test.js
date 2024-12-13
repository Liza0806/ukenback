const { getAllGroups } = require("../groupController");
const { Group } = require("../../../models/groupModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { date } = require("joi");

jest.mock("../../../models/groupModel.js", () => ({
  Group: {
    find: jest.fn(),
  },
}));

describe("getAllGroups Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Group.find.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getAllGroups(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Error getting groups: Database error",
    });
  });

  it("должен вернуть 200 и массив групп", async () => {
    const mockGroups = [
        {
            _id: "1",
            title: "Group 1",
            coachId: "coach1",
            payment: [],
            schedule: [],
            participants: [],
          },
          {
            _id: "2",
            title: "Group 2",
            coachId: "coach2",
            payment: [],
            schedule: [],
            participants: [],
          },
    ];
    Group.find.mockResolvedValueOnce(mockGroups); // Мок успешного ответа

    const req = httpMocks.createRequest(); // Мокаем запрос
    const res = httpMocks.createResponse(); // Мокаем ответ

    await getAllGroups(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockGroups); // Проверяем, что вернулись данные
  });
  it("должен вернуть все группы при успешном выполнении запроса", async () => {
    const groups = [
        {
            _id: "1",
            title: "Group 1",
            coachId: "coach1",
            payment: [],
            schedule: [],
            participants: [],
          },
          {
            _id: "2",
            title: "Group 2",
            coachId: "coach2",
            payment: [],
            schedule: [],
            participants: [],
          },
    ];
    await Group.find.mockResolvedValueOnce(groups);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllGroups(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toHaveLength(groups.length);
    expect(JSON.parse(res._getData())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Group 1" }),
        expect.objectContaining({ title: "Group 2" }),
      ])
    );
  });
  it("должен вернуть пустой массив, если групп нет", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllGroups(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getData().length).toEqual(0);
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllGroups(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});
