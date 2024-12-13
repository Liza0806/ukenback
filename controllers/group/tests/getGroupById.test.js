const { getGroupById } = require("../groupController");
const { Group } = require("../../../models/groupModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { date } = require("joi");

jest.mock("../../../models/groupModel.js", () => ({
  Group: {
    findById: jest.fn(),
  },
}));

describe("getGroupById Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Group.findById.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
      params: { _id: "1" },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getGroupById(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
 
    expect(responseData).toEqual({
      message: "Error getting group: Database error",
    });
  });

  it("должен вернуть 200 и группу", async () => {
    const mockGroup =  {
        _id: "1",
        title: "Group 1",
        coachId: "coach1",
        payment: [],
        schedule: [],
        participants: [],
      };
    await Group.findById.mockResolvedValueOnce(mockGroup); // Мок успешного ответа

    const req = httpMocks.createRequest({
      params: { _id: "1" },
    });
    const res = httpMocks.createResponse();

    await getGroupById(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockGroup); // Проверяем, что вернулись данные
  });
  it("должен вернуть группу при успешном выполнении запроса", async () => {
    const group =  {
        _id: "1",
        title: "Group 1",
        coachId: "coach1",
        payment: [],
        schedule: [],
        participants: [],
      };
    await Group.findById.mockResolvedValueOnce(group);

    const req = httpMocks.createRequest({
      params: { _id: "1" },
    });
    const res = httpMocks.createResponse();

    await getGroupById(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(JSON.parse(res._getData())).toEqual(group) // Проверяем, что объект содержит нужное поле
  });

  it("должен вернуть пустой массив, если события нет", async () => {
    const req = httpMocks.createRequest({
      params: { _id: "1" },
    });
    const res = httpMocks.createResponse();

    await getGroupById(req, res);

    expect(res.statusCode).toBe(404);
    // console.log(res._getData())
    expect(res._getJSONData()).toEqual({ message: "Group not found" });
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getGroupById(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});
