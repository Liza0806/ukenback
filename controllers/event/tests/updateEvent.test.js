const { updateEvent } = require("../eventsController");
const { validateData } = require("../../../helpers/validators");
const { Event } = require("../../../models/eventModel");
const httpMocks = require("node-mocks-http");

jest.mock("../../../helpers/validators", () => ({
  validateData: jest.fn(),
}));
// Мокаем необходимые зависимости
jest.mock("../../../models/eventModel", () => {
  const saveMock = jest.fn();
  const findByIdMock = jest.fn();
  const validateMock = jest.fn().mockImplementation((data) => {
    if (!data._id) {
      return { error: { details: [{ message: '"_id" is required' }] } }; // Создаем ошибку
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
    Event: Object.assign(EventMock, {
      findById: findByIdMock, // Добавляем метод findById
    }),
    schemas: mockSchemas,
    __mocks__: {
      saveMock,
      validateMock,
      findByIdMock, // Экспортируем мок для findById
    },
  };
});

jest.mock("../../../helpers/validators", () => {
  return {
    validateData: jest.fn().mockImplementation(() => ({
      error: null,
      value: {
        _id: "111",
        group: "1",
        groupTitle: "Title",
        isCancelled: false,
        date: new Date().toISOString(),
        participants: [],
      },
    })),
  };
});

describe("updateEvent Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Очищаем моки перед каждым тестом
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    Event.mockImplementationOnce(() => {
      return {
        save: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      };
    });
    const eventData = {
      _id: "111",
      group: "1",
      groupTitle: "groupTitle1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    validateData.mockImplementationOnce(() => eventData);
    Event.findById.mockResolvedValueOnce({
      _id: "111",
      group: "1",
      groupTitle: "groupTitle1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
      save: jest.fn().mockRejectedValueOnce(new Error("Database error")), // Симуляция сбоя при сохранении
    });

    const req = httpMocks.createRequest({
      body: eventData,
      params: {
        eventId: "111",
      },
    });

    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await updateEvent(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: "Internal Server Error: Database error",
    });
  });

  it("должен вернуть ошибку 400 при ошибке валидации", async () => {
    // Мокаем findById, чтобы он возвращал событие
    Event.findById.mockResolvedValueOnce({
      _id: "111",
      group: "1",
      groupTitle: "groupTitle1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
      save: jest.fn(),
    });

    // Мокаем функцию валидации, чтобы она выбрасывала ошибку
    validateData.mockImplementationOnce(() => {
      throw new Error('Validation error: "group" is required');
    });

    const req = httpMocks.createRequest({
      body: {
        groupTitle: "Title",
        isCancelled: false,
        date: new Date().toISOString(),
        participants: [],
      },
      params: {
        eventId: "111",
      },
    });

    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await updateEvent(req, res);

    // Проверяем, что метод status был вызван с кодом 400
    expect(res.statusCode).toBe(400);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: 'Validation error: "group" is required',
    });
  });

  it("должен успешно обновить событие и вернуть 200", async () => {
    const saveMock = jest.fn().mockResolvedValueOnce();
    const eventData = {
      _id: "111",
      group: "1",
      groupTitle: "groupTitle1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
      save: saveMock, // Добавляем замоканный save
    };

    // Мокаем findById так, чтобы он возвращал событие
    Event.findById.mockResolvedValueOnce(eventData);

    // Мокаем функцию валидации
    validateData.mockImplementationOnce(() => ({
      _id: "111",
      group: "1",
      groupTitle: "Updated Title",
      isCancelled: true,
      date: new Date().toISOString(),
      participants: [],
    }));

    const req = httpMocks.createRequest({
      body: {
        _id: "111",
        group: "1",
        groupTitle: "Updated Title",
        isCancelled: true,
        date: new Date().toISOString(),
        participants: [],
      },
      params: {
        eventId: "111",
      },
    });

    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await updateEvent(req, res);

    // Проверяем, что метод status был вызван с кодом 200
    expect(res.statusCode).toBe(200);

    // Проверяем, что метод json был вызван с обновленным событием
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      _id: "111",
      group: "1",
      groupTitle: "Updated Title",
      isCancelled: true,
      date: expect.any(String),
      participants: [],
    });

    // Проверяем, что save был вызван
    expect(saveMock).toHaveBeenCalled();
  });
});
