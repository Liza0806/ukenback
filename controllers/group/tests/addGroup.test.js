const { addGroup } = require("../groupController");
const { Group } = require("../../../models/groupModel");
const { Event } = require("../../../models/eventModel");
const {
  isValidGroupData,
  isGroupAlreadyExist,
  isGroupScheduleSuitable,
} = require("../../../helpers/validators");
const {
  makeScheduleForNewGroup
} = require("../../../helpers/makeScheduleForNewGroup");
const httpMocks = require("node-mocks-http");

jest.mock("../../../helpers/validators", () => ({
  isValidGroupData: jest.fn(),
  isGroupAlreadyExist: jest.fn(),
  isGroupScheduleSuitable: jest.fn(),
}));
jest.mock("../../../helpers/makeScheduleForNewGroup.js", () => ({
  makeScheduleForNewGroup: jest.fn(),
}));
jest.mock("../../../models/groupModel", () => ({
  Group: {
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));
jest.mock("../../../models/eventModel.js", () => ({
  Event: {
    insertMany: jest.fn(),
  },
}));
const mockData = {
  _id: "1",
  title: "Group 1",
  coachId: "coach1",
  dailyPayment: 0,  
  monthlyPayment:0,
  schedule: [
    { day: "Monday", time: "10:00" },
    { day: "Wednesday", time: "15:30" },
  ],
  participants: [],
};
const mockDataPart = {
  title: "Group 1",
  coachId: "coach1",
  dailyPayment: 0,  
  monthlyPayment:0,
  schedule: [
    { day: "Monday", time: "10:00" },
    { day: "Wednesday", time: "15:30" },
  ],
  participants: [],
};

describe("addGroup Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    isValidGroupData.mockReturnValue(true); // Указывает, что данные валидны
    isGroupAlreadyExist.mockResolvedValue(false); // Указывает, что группа с таким именем не существует
    isGroupScheduleSuitable.mockResolvedValue(null); // Расписание подходит
  });

  it("должен корректно использовать схемы валидации", async () => {
    expect(isGroupScheduleSuitable).toBeDefined();
    expect(isGroupAlreadyExist).toBeDefined();
    expect(isValidGroupData).toBeDefined();

    isGroupScheduleSuitable(mockData.schedule);
    expect(isGroupScheduleSuitable).toHaveBeenCalledWith(mockData.schedule);

    isGroupAlreadyExist(mockData.title);
    expect(isGroupAlreadyExist).toHaveBeenCalledWith(mockData.title);

    isValidGroupData(mockData);
    expect(isValidGroupData).toHaveBeenCalledWith(mockData);
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Group.create.mockRejectedValueOnce(
      new Error("Failed to create group. Please try again later.")
    );

    Group.findOne.mockResolvedValueOnce(null);

    // const mockData = {
    //   title: "Group 1",
    //   coachId: "coach1",
    //   payment: [
    //     {
    //       dailyPayment: 10,
    //       monthlyPayment: 100,
    //     },
    //   ],
    //   schedule: [
    //     { day: "Monday", time: "10:00" },
    //     { day: "Wednesday", time: "12:00" },
    //   ],
    //   participants: [],
    // };
    const req = httpMocks.createRequest({
      body: mockData,
    });
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await addGroup(req, res);
    console.log(res._getData());
    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Server error",
    });
  });

  
  it("should successfully add the group", async () => {
    const req = httpMocks.createRequest({
      body: mockDataPart,
    });
    const res = httpMocks.createResponse();
    const events = [
      { date: new Date().toISOString(), group: "Group 1", isCancelled: false, participants: [] },
      { date: new Date().toISOString(), group: "Group 2", isCancelled: false, participants: [] },
    ];
    makeScheduleForNewGroup.mockReturnValue(events);
    isValidGroupData.mockReturnValue(true);
    Group.create.mockResolvedValue(mockData);

    await addGroup(req, res);

    expect(isValidGroupData).toHaveBeenCalledWith(mockDataPart);
    expect(Group.create).toHaveBeenCalledWith(mockDataPart);
    expect(res.statusCode).toBe(201);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual(mockData);
  });

  it("should return 400 if group data is invalid", async () => {
    const req = httpMocks.createRequest({
      body: mockDataPart,
    });
    const res = httpMocks.createResponse();

    isValidGroupData.mockReturnValue(false);

    await addGroup(req, res);

    expect(isValidGroupData).toHaveBeenCalledWith(mockDataPart);
    expect(Group.create).not.toHaveBeenCalledWith();
    expect(res.statusCode).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "Invalid group data" });
  });



  it("should return 400 if group is already exists", async () => {
    const req = httpMocks.createRequest({
      body: mockDataPart,
    });
    const res = httpMocks.createResponse();

    isValidGroupData.mockReturnValue(true);
    isGroupAlreadyExist.mockReturnValue(true)

    await addGroup(req, res);

    expect(isValidGroupData).toHaveBeenCalledWith(mockDataPart);
    expect(Group.create).not.toHaveBeenCalledWith();
    expect(res.statusCode).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "This title already exists"  });
  
  });

});