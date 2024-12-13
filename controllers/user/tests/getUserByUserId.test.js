const { getUserByUserId } = require("../userController");
const { User } = require("../../../models/userModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { date } = require("joi");

jest.mock("../../../models/userModel.js", () => ({
  User: {
    findById: jest.fn(),
  },
}));

describe("getUserByUserId Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    User.findById.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
      params: { id: "1" },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getUserByUserId(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
 
    expect(responseData).toEqual({
      message: "Error getting user: Database error",
    });
  });
  
  it('должен вернуть 400 если id не передано', async () => {
    const req = httpMocks.createRequest({
        params: { id: undefined },
      });
      const res = httpMocks.createResponse();
      await getUserByUserId(req, res);
      const responseData = JSON.parse(res._getData());
      expect(res.statusCode).toBe(400);
      expect(responseData).toEqual({
        message: "Id is required",
      });
  });
  it("должен вернуть 200 и юзера", async () => {
    const mockUser =   {
        _id: "1",
        name: "userName 1",
        password: "111",
        phone: "11111",
        isAdmin: false,
        groups: [],
        balance: 11,
        telegramId: 111,
        discount: 11,
        visits: [],
      };
    await User.findById.mockResolvedValueOnce(mockUser); // Мок успешного ответа

    const req = httpMocks.createRequest({
      params: { id: "1" },
    });
    const res = httpMocks.createResponse();

    await getUserByUserId(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockUser); // Проверяем, что вернулись данные
  });
  it("должен вернуть юзера при успешном выполнении запроса", async () => {
    const user =   {
        _id: "1",
        name: "userName 1",
        password: "111",
        phone: "11111",
        isAdmin: false,
        groups: [],
        balance: 11,
        telegramId: 111,
        discount: 11,
        visits: [],
      };
    await User.findById.mockResolvedValueOnce(user);

    const req = httpMocks.createRequest({
      params: { id: "1" },
    });
    const res = httpMocks.createResponse();

    await getUserByUserId(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(JSON.parse(res._getData())).toEqual(user) // Проверяем, что объект содержит нужное поле
  });

  it("должен вернуть пустой массив, если юзера нет", async () => {
    const req = httpMocks.createRequest({
      params: { id: "1" },
    });
    const res = httpMocks.createResponse();

    await getUserByUserId(req, res);

    expect(res.statusCode).toBe(404);
    // console.log(res._getData())
    expect(res._getJSONData()).toEqual({ message: "User not found" });
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getUserByUserId(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});
