const { Group } = require("../../../models/groupModel"); // Укажите путь к вашей модели
const { updateGroup } = require("../groupController"); // Укажите путь к вашему контроллеру
const { isValidGroupData } = require("../../../helpers/validators"); 
jest.mock("../../../models/groupModel"); // Мок модели Group
// jest.mock("../../../helpers/validators"); // Мок функции валидации

const httpMocks = require("node-mocks-http");
jest.mock("../../../helpers/validators", () => ({
    isValidGroupData: jest.fn(),
  }));
  

describe("updateGroup Controller", () => {
  const mockRequest = (params, body) => ({
    params,
    body,
  });
  jest.mock("../../../models/groupModel", () => ({
    Group: {
      findByIdAndUpdate: jest.fn(),
    },
  }));

  const mockGroupId = "64abcd123ef4567890123456";
  const validGroupData = {
    title: "Group 1",
    coachId: "coach1",
    payment: [
      {
        dailyPayment: 10,
        monthlyPayment: 100,
      },
    ],
    schedule: [
      { day: "  Понеділок", time: "10:00" },
      { day: "Середа", time: "12:00" },
    ],
    participants: [],
  };

   it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    const req = httpMocks.createRequest({
        params: { id: mockGroupId },
        body: validGroupData,
      });
      const res = httpMocks.createResponse();

    isValidGroupData.mockReturnValue(true);
    Group.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));

    await updateGroup(req, res);

    expect(isValidGroupData).toHaveBeenCalledWith(validGroupData);
    expect(Group.findByIdAndUpdate).toHaveBeenCalledWith(mockGroupId, validGroupData, { new: true });
  
    expect(res.statusCode).toBe(500);
    const responseData = JSON.parse(res._getData());
    console.log(responseData)
    expect(responseData).toEqual({
        message: "Internal Server Error:",
      });
});



  it("should successfully update the group", async () => {
    const req = httpMocks.createRequest({
        params: { id: mockGroupId },
        body: validGroupData,
      });
      const res = httpMocks.createResponse();
 
    isValidGroupData.mockReturnValue(true);
    Group.findByIdAndUpdate.mockResolvedValue({ _id: mockGroupId, ...validGroupData });

    await updateGroup(req, res);

    expect(isValidGroupData).toHaveBeenCalledWith(validGroupData);
    expect(Group.findByIdAndUpdate).toHaveBeenCalledWith(mockGroupId, validGroupData, { new: true });
    expect(res.statusCode).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ updatedGroup: { _id: mockGroupId, ...validGroupData }, _id: mockGroupId });
  });



  it("should return 400 if group data is invalid", async () => {
    const req = httpMocks.createRequest({
        params: { id: mockGroupId },
        body: validGroupData,
      });
      const res = httpMocks.createResponse();

    isValidGroupData.mockReturnValue(false);

    await updateGroup(req, res);

    expect(isValidGroupData).toHaveBeenCalledWith(validGroupData);
    expect(Group.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "Invalid group data" });
  });



  it("should return 404 if group is not found", async () => {
    const req = httpMocks.createRequest({
        params: { id: mockGroupId },
        body: validGroupData,
      });
      const res = httpMocks.createResponse();

    isValidGroupData.mockReturnValue(true);
    Group.findByIdAndUpdate.mockResolvedValue(null);

    await updateGroup(req, res);

    expect(isValidGroupData).toHaveBeenCalledWith(validGroupData);
    expect(Group.findByIdAndUpdate).toHaveBeenCalledWith(mockGroupId, validGroupData, { new: true });
    expect(res.statusCode).toBe(404);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "Group not found" });
  });

});

