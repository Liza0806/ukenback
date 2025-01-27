const { getUsersByName } = require("../userController");
const { User } = require("../../../models/userModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { date } = require("joi");

jest.mock("../../../models/userModel.js", () => ({
  User: {
    find: jest.fn(),
  },
}));

describe("getUsersByName Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    User.find.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
        query: { name: "userName 1" },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getUsersByName(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
 
    expect(responseData).toEqual({
      message: "Error getting user: Database error",
    });
  });

  it("должен вернуть 200 и юзера", async () => {
    const mockUser = {
      _id: "1",
      name: "userName 1",
      password: "111",
      phone: "11111",
      isAdmin: false,
      groups: [],
      balance: 11,
      telegramId: 111,
      visits: [],
    };
  
    // Мок успешного ответа
    User.find.mockResolvedValueOnce([mockUser]); // `find` возвращает массив
  
    const req = httpMocks.createRequest({
      query: { name: "userName 1" },
    });
    const res = httpMocks.createResponse();
  
    // Передаем контроллер для выполнения
    await getUsersByName(req, res);
  
    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual([mockUser]); // Проверяем, что вернулись данные
  });
    it('должен вернуть 400 если имя не передано', async () => {
    const req = httpMocks.createRequest({
        query: { name: undefined },
      });
      const res = httpMocks.createResponse();
      await getUsersByName(req, res);
      const responseData = JSON.parse(res._getData());
      expect(res.statusCode).toBe(400);
      expect(responseData).toEqual({
        message: "Name query parameter is required",
      });
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
        visits: [],
      };
    await User.find.mockResolvedValueOnce(user);

    const req = httpMocks.createRequest({
        query: { name: "userName 1" },
    });
    const res = httpMocks.createResponse();

    await getUsersByName(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(JSON.parse(res._getData())).toEqual(user) // Проверяем, что объект содержит нужное поле
  });

  it("должен вернуть 404, если юзера нет", async () => {
    // Настраиваем мок User.find для возврата пустого массива
    User.find.mockResolvedValueOnce([]);

    const req = httpMocks.createRequest({
      query: { name: "userName 1" },
    });
    const res = httpMocks.createResponse();

    await getUsersByName(req, res);

    // Проверяем, что статус 404 и сообщение об ошибке корректны
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: "No users found" });
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getUsersByName(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});
