const { User, schemas } = require("../../../models/userModel");
const { addUser } = require("../userController");
const { validateData } = require("../../../helpers/validators");
jest.mock("../../../models/userModel.js"); 

const httpMocks = require("node-mocks-http");
jest.mock("../../../helpers/validators", () => ({
  validateData: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

jest.mock("../../../models/userModel.js", () => {
  const create = jest.fn();
  const validateMock = jest.fn().mockImplementation((data) => {
    if (!data._id) {
      return { error: { details: [{ message: '"_id" is required' }] } }; // Создаем ошибку
    }
    return { value: data }; // Возвращаем данные, если все нормально
  });

  const mockSchemas = {
    registerSchema: {
      validate: validateMock, // Мокируем метод validate
    },
  };
  const UserMock = jest.fn().mockImplementation((data) => ({
    ...data,
    create: create,
  }));
  return {
    User: Object.assign(UserMock, {
        create: create,
    }),
    schemas: mockSchemas,
    __mocks__: {
      create,
      validateMock,
    },
  };
});

jest.mock("../../../helpers/validators", () => {
  return {
    validateData: jest.fn().mockImplementation(() => ({
      error: null,
      value: {
        name: "userName 1",
        password: "hashed_password",
        phone: "11111",
        isAdmin: false,
        groups: [],
        balance: 11,
        telegramId: 111,
        discount: 11,
        visits: [],
      },
    })),
  };
});
describe("addUser Controller", () => {
  const validUserData = {
    name: "userName 1",
    password: "hashed_password",
    phone: "11111",
    isAdmin: false,
    groups: [],
    balance: 11,
    telegramId: 111,
    discount: 11,
    visits: [],
  };
  it("должен корректно использовать схему валидации", async () => {
    // Проверяем, что v определен
    expect(schemas.registerSchema).toBeDefined();

    // Проверяем, что метод validate определен
    expect(schemas.registerSchema.validate).toBeDefined();
    schemas.registerSchema.validate(validUserData);

    const { validateMock } = require("../../../models/userModel").__mocks__;
    expect(validateMock).toHaveBeenCalledWith(validUserData);
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем базу данных, чтобы она вернула ошибку
    User.create.mockRejectedValueOnce(new Error("Database error"));
    validateData.mockImplementationOnce(() => validUserData);

    const req = httpMocks.createRequest({
      body: validUserData,
    });

    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await addUser(req, res);
    debugger;
    // Проверяем статус ответа
    expect(res.statusCode).toBe(500);

    // Проверяем данные в ответе
    const responseData = JSON.parse(res._getData());
    console.log(responseData);
    expect(responseData).toEqual({
      message: "Internal Server Error: Database error",
    });
  });

  it("should successfully add the user", async () => {
    const validatedUserData = {
      _id: "1",
      name: "userName 1",
      phone: "11111",
      discount: 11,
      password: "1111111",
      isAdmin: false,
      groups: [],
      balance: 11,
      telegramId: 111,
      visits: [],
    };

    const date = new Date();

    User.create.mockResolvedValueOnce({
      ...validatedUserData,
    });

    validateData.mockImplementationOnce(() => validatedUserData);

    const req = httpMocks.createRequest({
      body: { ...validatedUserData },
    });
    const res = httpMocks.createResponse();

    await addUser(req, res);

    // Проверяем вызов validateData
    expect(validateData).toHaveBeenCalledWith(schemas.registerSchema, {
      name: "userName 1",
      phone: "11111",
      discount: 11,
      password: "1111111",
      isAdmin: false,
      groups: [],
      balance: 11,
      telegramId: 111,
      visits: [],
    });

    // Проверяем вызов findByIdAndUpdate
    expect(User.create).toHaveBeenCalledWith(
      validatedUserData,
    );

    // Проверяем статус ответа
    expect(res.statusCode).toBe(201);

    // Проверяем тело ответа
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      _id: '1',
      name: "userName 1",
      phone: "11111",
      discount: 11,
      isAdmin: false,
      groups: [],
      balance: 11,
      telegramId: 111,
      visits: [],
    });
  });

  it("should return 400 if user data is invalid", async () => {
    const req = httpMocks.createRequest({
      body: { ...validUserData },
    });
    const res = httpMocks.createResponse();

    validateData.mockImplementationOnce(() => {
      throw new Error("Validation error");
    });

    await addUser(req, res);

    expect(res.statusCode).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "Validation error" });
  });
  it("should return 400 if user password is invalid", async () => {
    const inValidUserData = {
        name: "userName 1",
        phone: "11111",
        isAdmin: false,
        groups: [],
        balance: 11,
        telegramId: 111,
        discount: 11,
        visits: [],
      };
    const req = httpMocks.createRequest({
      body: { ...inValidUserData },
    });
    const res = httpMocks.createResponse();

    validateData.mockImplementationOnce(() => {
      throw new Error("Invalid password");
    });

    await addUser(req, res);

    expect(res.statusCode).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "Invalid password" });
  });
});
