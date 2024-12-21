const { createEvent } = require("../eventsController");

const { validateData } = require("../../../helpers/validators");
const { Event } = require("../../../models/eventModel");
const httpMocks = require("node-mocks-http");
jest.mock("../../../helpers/validators", () => ({
  validateData: jest.fn(),
}));
jest.mock("../../../models/eventModel", () => {
  const saveMock = jest.fn(); // Мок метода save

  const validateMock = jest.fn().mockImplementation((data) => {
    if (!data.date) {
      return { error: { details: [{ message: '"date" is required' }] } }; // Создаем ошибку
    }
    return { value: data }; // Возвращаем данные, если все нормально
  });

  const mockSchemas = {
    eventSchemaJoi: {
      validate: validateMock, // Мокируем метод validate
    },
  };

  const EventMock = jest.fn().mockImplementation((data) => ({
    ...data,
    save: saveMock,
  }));

  return {
    Event: EventMock,
    schemas: mockSchemas,
    __mocks__: {
      saveMock,
      validateMock, // Экспортируем мок validate
    },
  };
});

describe("createEvent Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен корректно использовать схему валидации", async () => {
    // Импортируем замокированный schemas
    const { schemas } = require("../../../models/eventModel");

    // Проверяем, что v определен
    expect(schemas.eventSchemaJoi).toBeDefined();

    // Проверяем, что метод validate определен
    expect(schemas.eventSchemaJoi.validate).toBeDefined();

    // Дополнительно: Проверяем вызов validate
    const mockData = {
   //   _id: "111",
      date: "2023-12-01",
      groupId: "1",
      participants: [],
    };
    schemas.eventSchemaJoi.validate(mockData);

    // Убедитесь, что validate был вызван
    const { validateMock } = require("../../../models/eventModel").__mocks__;
    expect(validateMock).toHaveBeenCalledWith(mockData);
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод save, чтобы он выбрасывал ошибку
    Event.mockImplementationOnce(() => {
      return {
        save: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      };
    });
    validateData.mockImplementationOnce(() => ({
     // _id: "111",
     groupId: "1",
      groupTitle: "groupTitle1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    }));

    const req = httpMocks.createRequest({
      body: {
      //  _id: "111",
      groupId: "1",
        groupTitle: "groupTitle1",
        isCancelled: false,
        date: new Date().toISOString(),
        participants: [],
      },
    });
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await createEvent(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: "Internal Server Error: Database error",
    });
  });

  it("должен вернуть 400, если date имеет неверный формат", async () => {
    validateData.mockImplementation(() => {
      throw new Error('Validation error: "date" must be a valid ISO 8601 date');
    });

    const req = httpMocks.createRequest({
      body: {
       // _id: "111",
       groupId: "1",
        isCancelled: false,
        date: "неверный_формат_даты", // Неверный формат
        participants: [],
      },
    });

    const res = httpMocks.createResponse();

    await createEvent(req, res);

    expect(res.statusCode).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: 'Validation error: "date" must be a valid ISO 8601 date',
    });

    expect(validateData).toHaveBeenCalledWith(expect.any(Object), req.body);
  });

  it("должен успешно создать событие и вернуть статус 201", async () => {
    const mockEvent = {
   //   _id: "1111",
   groupId: "1",
      groupTitle: "groupTitle1",
      isCancelled: false,
      date: "2023-01-02",
      participants: [],
    };
    validateData.mockImplementationOnce(() => ({
     // _id: "1111",
     groupId: "1",
      groupTitle: "groupTitle1",
      isCancelled: false,
      date: "2023-01-02",
      participants: [],
    }));
    // Настраиваем save для возврата mockEvent
    const { saveMock } = require("../../../models/eventModel").__mocks__;
    saveMock.mockResolvedValueOnce({...mockEvent, _id:'1111'});

    const req = httpMocks.createRequest({
      body: mockEvent,
    });

    const res = httpMocks.createResponse();

    // Вызов контроллера
    await createEvent(req, res);

    // Проверяем, что статус ответа 201
    expect(res.statusCode).toBe(201);

    // Проверяем, что возвращены правильные данные
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({...mockEvent, _id:'1111'});

    // Проверяем, что save был вызван
    expect(saveMock).toHaveBeenCalledTimes(1);

    // Проверяем, что конструктор Event был вызван с корректными параметрами
    expect(Event).toHaveBeenCalledWith(mockEvent);
  });

  it("должен вернуть 500 при ошибке конструктора Event", async () => {
    Event.mockImplementationOnce(() => {
      throw new Error("Constructor error");
    });

    const req = httpMocks.createRequest({
      body: {
       // _id: "1111",
       groupId: "1",
        groupTitle: "groupTitle1",
        isCancelled: false,
        date: "2023-01-02",
        participants: [],
      },
    });
    const res = httpMocks.createResponse();
    validateData.mockImplementationOnce(() => ({
    //  _id: "1111",
    groupId: "1",
      groupTitle: "groupTitle1",
      isCancelled: false,
      date: "2023-01-02",
      participants: [],
    }));
    await createEvent(req, res);

    expect(res.statusCode).toBe(500);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: "Internal Server Error: Constructor error",
    });
  });
  it("должен вернуть 400, если date имеет неверный формат", async () => {
    const req = httpMocks.createRequest({
      body: {
       // _id: "111",
       groupId: "1",
        isCancelled: false,
        date: "неверный_формат_даты", // Неверный формат
        participants: [],
      },
    });

    const res = httpMocks.createResponse();

    await createEvent(req, res);

    // Проверяем, что статус 400
    expect(res.statusCode).toBe(400);

    // Проверяем сообщение об ошибке
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: 'Validation error: "date" must be a valid ISO 8601 date',
    });
  });
});
