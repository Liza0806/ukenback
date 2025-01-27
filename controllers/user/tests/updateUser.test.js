const { User, schemas } = require("../../../models/userModel");
const { updateUser } = require("../userController");
const { validateData } = require("../../../helpers/validators");
jest.mock("../../../models/userModel.js"); // Мок модели Group

const httpMocks = require("node-mocks-http");
jest.mock("../../../helpers/validators", () => ({
  validateData: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

jest.mock("../../../models/userModel.js", () => {
  const saveMock = jest.fn();
  const findByIdAndUpdate = jest.fn();
  const validateMock = jest.fn().mockImplementation((data) => {
    if (!data._id) {
      return { error: { details: [{ message: '"_id" is required' }] } }; // Создаем ошибку
    }
    return { value: data }; // Возвращаем данные, если все нормально
  });

  const mockSchemas = {
    updateSchema: {
      validate: validateMock, // Мокируем метод validate
    },
  };
  const UserMock = jest.fn().mockImplementation((data) => ({
    ...data,
    save: saveMock,
  }));
  return {
    User: Object.assign(UserMock, {
      findByIdAndUpdate: findByIdAndUpdate,
    }),
    schemas: mockSchemas,
    __mocks__: {
      saveMock,
      validateMock,
      findByIdAndUpdate,
    },
  };
});
jest.mock("../../../helpers/validators", () => {
  return {
    validateData: jest.fn().mockImplementation(() => ({
      error: null,
      value: {
        _id: "1",
        name: "userName 1",
        password: "hashed_password",
        phone: "11111",
        isAdmin: false,
        groups: [],
        balance: 11,
        telegramId: 111,
        visits: [],
      },
    })),
  };
});
describe("updateUser Controller", () => {
  const validUserData = {
    _id: "1",
    name: "userName 1",
    password: "hashed_password",
    phone: "11111",
    isAdmin: false,
    groups: [],
    balance: 11,
    telegramId: 111,
    visits: [],
  };
  it("должен корректно использовать схему валидации", async () => {
    // Проверяем, что v определен
    expect(schemas.updateSchema).toBeDefined();

    // Проверяем, что метод validate определен
    expect(schemas.updateSchema.validate).toBeDefined();
    schemas.updateSchema.validate(validUserData);

    const { validateMock } = require("../../../models/userModel").__mocks__;
    expect(validateMock).toHaveBeenCalledWith(validUserData);
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем базу данных, чтобы она вернула ошибку
     User.findByIdAndUpdate.mockRejectedValueOnce(new Error("Database error"));
     validateData.mockImplementationOnce(() => validUserData);

    const req = httpMocks.createRequest({
      params: { userId: "1" }, 
      body: validUserData, 
    });

    const res = httpMocks.createResponse();
  
    // Вызываем контроллер
    await updateUser(req, res);
  debugger
    // Проверяем статус ответа
    expect(res.statusCode).toBe(500);
  
    // Проверяем данные в ответе
    const responseData = JSON.parse(res._getData());
    console.log(responseData);
    expect(responseData).toEqual({
      message: "Internal Server Error: Database error",
    });
  });
 
  it("should successfully update the user", async () => {
    const validatedUserData = {
      _id: "1",
      name: "userName 1",
      phone: "11111",
      isAdmin: false,
      groups: [],
      balance: 11,
      telegramId: 111,
      password: "hashed_password",
      visits: [],
    };
  
    User.findByIdAndUpdate.mockResolvedValueOnce({
      _id: "1",
      ...validatedUserData,
      updatedAt: new Date(),
    });
  
    validateData.mockImplementationOnce(() => validUserData);
  
    const req = httpMocks.createRequest({
      params: { userId: "1" },
      body: { ...validUserData, password: "1111111" },
    });
    const res = httpMocks.createResponse();
  
    await updateUser(req, res);
  
    expect(validateData).toHaveBeenCalledWith(schemas.updateSchema, {
      _id: "1",
      name: "userName 1",
      phone: "11111",
      isAdmin: false,
      groups: [],
      balance: 11,
      telegramId: 111,
      visits: [],
      password: "hashed_password", // Мок хэша пароля
    });
    
  
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      validatedUserData,
      { new: true }
    );
  
    expect(res.statusCode).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      _id: "1",
      name: "userName 1",
      phone: "11111",
      isAdmin: false,
      groups: [],
      balance: 11,
      telegramId: 111,
      visits: [],
      updatedAt: expect.any(String), // Поле даты
    });
  });

  it("should return 400 if user data is invalid", async () => {
    const req = httpMocks.createRequest({
      params: { userId: "1" },
      body: { ...validUserData, password: "1111111" },  // Invalid password
    });
    const res = httpMocks.createResponse();
  
    validateData.mockImplementationOnce(() => { throw new Error("Validation error"); });
  
    await updateUser(req, res);
  
    expect(res.statusCode).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "Validation error" });
  });
  

  it("should return 404 if group is not found", async () => {
    const req = httpMocks.createRequest({
      params: { userId: "1" },
      body: { ...validUserData, password: "1111111" },
    });
    const res = httpMocks.createResponse();

    validateData.mockImplementationOnce(() => validUserData);
    User.findByIdAndUpdate.mockResolvedValue(null);

    await updateUser(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('1', validUserData, { new: true });
    expect(res.statusCode).toBe(404);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "User not found" });
  });
});
