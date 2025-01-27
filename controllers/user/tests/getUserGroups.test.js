const { getUserGroups } = require("../userController");
const { User } = require("../../../models/userModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");

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
      params: { userId: "1" },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getUserGroups(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
 
    expect(responseData).toEqual({
      message: "Internal Server Error: Database error",
    });
  });
  
  it('должен вернуть 400 если id не передано', async () => {
    const req = httpMocks.createRequest({
        params: { userId: undefined },
      });
      const res = httpMocks.createResponse();
      await getUserGroups(req, res);
      const responseData = JSON.parse(res._getData());
      expect(res.statusCode).toBe(400);
      expect(responseData).toEqual({
        message: "User ID is required",
      });
  });
  it("должен вернуть 200 и группы юзера", async () => {
    const mockUser =   {
        _id: "1",
        name: "userName 1",
        password: "111",
        phone: "11111",
        isAdmin: false,
        groups: ['Group1', 'Group2'],
        balance: 11,
        telegramId: 111,
        visits: [
          {
            date: "2024-12-15",
            groupId: "60d21b7667d0d8992e610c85",
            eventId: "60d21b7667d0d8992e610c86" 
          },{ 
          date: "2024-12-16",
          groupId: "60d21b7667d0d8992e610c87",
          eventId: "60d21b7667d0d8992e610c88" 
        }
      ]}
    await User.findById.mockResolvedValueOnce(mockUser); // Мок успешного ответа

    const req = httpMocks.createRequest({
      params: { userId: "1" },
    });
    const res = httpMocks.createResponse();

    await getUserGroups(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockUser.groups); // Проверяем, что вернулись данные
  }); 
   it("должен вернуть сообщение, если групп нет", async () => {
    const req = httpMocks.createRequest({
      params: { userId: "1" },
    });
    const res = httpMocks.createResponse();
  
    // Мокируем метод findById, чтобы вернуть пользователя без групп
    User.findById = jest.fn().mockResolvedValueOnce({ groups: [] });
  
    await getUserGroups(req, res);
  
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: "This user has no groups" });
  });
  
  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getUserGroups(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});
