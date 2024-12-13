const { getAllUsers } = require("../userController");
const { User } = require("../../../models/userModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { date } = require("joi");

jest.mock("../../../models/userModel", () => ({
  User: {
    find: jest.fn(),
  },
}));

describe("getAllUsers Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    User.find.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getAllUsers(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Error getting users: Database error",
    });
  });

  it("должен вернуть 200 и массив юзеров", async () => {
    const mockUsers = [
        {
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
          },
          {
            _id: "2",
            name: "userName 2",
            password: "222",
            phone: "22222",
            isAdmin: true,
            groups: [],
            balance: 22,
            telegramId: 222,
            discount: 22,
            visits: [],
          },
    ];
    User.find.mockResolvedValueOnce(mockUsers); // Мок успешного ответа

    const req = httpMocks.createRequest(); // Мокаем запрос
    const res = httpMocks.createResponse(); // Мокаем ответ

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockUsers); // Проверяем, что вернулись данные
  });
  it("должен вернуть всех юзеров при успешном выполнении запроса", async () => {
    const users = [
        {
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
          },
          {
            _id: "2",
            name: "userName 2",
            password: "222",
            phone: "22222",
            isAdmin: true,
            groups: [],
            balance: 22,
            telegramId: 222,
            discount: 22,
            visits: [],
          },
    ];
    await User.find.mockResolvedValueOnce(users);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toHaveLength(users.length);
    expect(JSON.parse(res._getData())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "userName 1" }),
        expect.objectContaining({ name: "userName 2" }),
      ])
    );
  });
  it("должен вернуть пустой массив, если юзеров нет", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllUsers(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getData().length).toEqual(0);
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllUsers(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});
