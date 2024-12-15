const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { deleteGroup } = require("../groupController");
const { Group } = require("../../../models/groupModel");
const { Event } = require("../../../models/eventModel");

jest.mock("../../../models/groupModel");
jest.mock("../../../models/eventModel");
const mockGroupId = "64abcd123ef4567890123456";
describe("deleteGroup Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if group is not found", async () => {
    const req = httpMocks.createRequest({
      params: { id: new mongoose.Types.ObjectId().toString() },
    });
    const res = httpMocks.createResponse();

    Group.findByIdAndDelete.mockResolvedValue(null);

    await deleteGroup(req, res);

    expect(Group.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: "Group not found" });
  });

  it("should delete group and associated future events", async () => {
    const mockDate = new Date("2024-12-12T17:36:41.000Z").toISOString(); // Зафиксированная дата

    const req = httpMocks.createRequest({
      params: { id: mockGroupId },
    });
    const res = httpMocks.createResponse();

    Group.findByIdAndDelete.mockResolvedValue({
      _id: mockGroupId,
      title: "Test Group",
    });

    Event.deleteMany.mockResolvedValue({ deletedCount: 2 });

    jest.useFakeTimers().setSystemTime(new Date(mockDate)); // Задаём фиктивное текущее время

    // Вызываем контроллер
    await deleteGroup(req, res);

    // Проверяем вызовы
    expect(Group.findByIdAndDelete).toHaveBeenCalledWith(mockGroupId);
    expect(Event.deleteMany).toHaveBeenCalledWith({
      groupTitle: "Test Group",
      date: { $gt: mockDate }, // Используем фиксированное время
    });

    // Проверяем ответ
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: "Group deleted. Associated future events successfully deleted",
      _id: mockGroupId,
    });

    jest.useRealTimers(); // Сбрасываем фейковые таймеры
  });

  it("should handle when no associated future events are found", async () => {
    const mockDate = new Date("2024-12-12T17:36:41.000Z").toISOString(); // Зафиксированная дата
    const groupId = new mongoose.Types.ObjectId().toString();
    const mockGroup = { _id: groupId, title: "Test Group" };
    const mockEventResult = { deletedCount: 0 };

    const req = httpMocks.createRequest({
      params: { id: groupId },
    });
    const res = httpMocks.createResponse();

    Group.findByIdAndDelete.mockResolvedValue(mockGroup);
    Event.deleteMany.mockResolvedValue(mockEventResult);

    jest.useFakeTimers().setSystemTime(new Date(mockDate)); // Устанавливаем зафиксированное время

    await deleteGroup(req, res);

    expect(Group.findByIdAndDelete).toHaveBeenCalledWith(groupId);
    expect(Event.deleteMany).toHaveBeenCalledWith({
      groupTitle: "Test Group",
      date: { $gt: mockDate },
    });
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: "Group deleted. No associated future events found",
      _id: groupId,
    });

    jest.useRealTimers(); // Сбрасываем фейковые таймеры
  });

  it("should return 500 if an error occurs during group deletion", async () => {
    const req = httpMocks.createRequest({
      params: { id: new mongoose.Types.ObjectId().toString() },
    });
    const res = httpMocks.createResponse();

    Group.findByIdAndDelete.mockRejectedValue(
      new Error("Group deletion error")
    );

    await deleteGroup(req, res);

    expect(Group.findByIdAndDelete).toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: "Internal server error" });
  });
  it("should return 500 if an error occurs during event deletion", async () => {
    const mockDate = new Date("2024-12-12T17:36:41.000Z").toISOString(); // Зафиксированная дата
    const groupId = new mongoose.Types.ObjectId().toString();
    const mockGroup = { _id: groupId, title: "Test Group" };

    const req = httpMocks.createRequest({
      params: { id: groupId },
    });
    const res = httpMocks.createResponse();

    Group.findByIdAndDelete.mockResolvedValue(mockGroup);
    Event.deleteMany.mockRejectedValue(new Error("Event deletion error"));

    jest.useFakeTimers().setSystemTime(new Date(mockDate)); // Устанавливаем зафиксированное время

    await deleteGroup(req, res);

    expect(Group.findByIdAndDelete).toHaveBeenCalledWith(groupId);
    expect(Event.deleteMany).toHaveBeenCalledWith({
      groupTitle: "Test Group",
      date: { $gt: mockDate }, // Используем зафиксированное время
    });
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: "Internal server error" });

    jest.useRealTimers(); // Сбрасываем фейковые таймеры
  });
});
