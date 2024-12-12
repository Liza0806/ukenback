const { deleteEvent } = require("../eventsController");
const { Event } = require("../../../models/eventModel");
const httpMocks = require("node-mocks-http");

jest.mock("../../../models/eventModel", () => ({
  findByIdAndDelete: jest.fn(),
}));
jest.mock("../../../models/eventModel", () => {
  const findByIdAndDeleteMock = jest.fn();
  return {
    Event: Object.assign({
      findByIdAndDelete: findByIdAndDeleteMock,
    }),
  };
});

describe("deleteEvent Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть 500 при ошибке сервера", async () => {
    // Настраиваем ошибку базы данных
    Event.findByIdAndDelete.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
      params: { eventId: "111" },
    });

    const res = httpMocks.createResponse();

    await deleteEvent(req, res);

    expect(Event.findByIdAndDelete).toHaveBeenCalledWith("111");
    expect(res.statusCode).toBe(500);

    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: "Internal Server Error: Database error",
    });
  });
  it("должен удалить событие и вернуть сообщение о успешном удалении", async () => {
    // Настраиваем успешное удаление
    Event.findByIdAndDelete.mockResolvedValueOnce({
      _id: "111",
      group: "1",
      date: new Date().toISOString(),
    });

    const req = httpMocks.createRequest({
      params: { eventId: "111" },
    });

    const res = httpMocks.createResponse();

    await deleteEvent(req, res);

    expect(Event.findByIdAndDelete).toHaveBeenCalledWith("111");
    expect(res.statusCode).toBe(200);

    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "Event successfully deleted" });
  });

  it("должен вернуть 404, если событие не найдено", async () => {
    // Настраиваем результат, если событие не найдено
    Event.findByIdAndDelete.mockResolvedValueOnce(null);

    const req = httpMocks.createRequest({
      params: { eventId: "111" },
    });

    const res = httpMocks.createResponse();

    await deleteEvent(req, res);

    expect(Event.findByIdAndDelete).toHaveBeenCalledWith("111");
    expect(res.statusCode).toBe(404);

    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "Event not found" });
  });
});
