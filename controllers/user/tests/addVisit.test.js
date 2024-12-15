const { addVisit } = require("../userController");
const { User } = require("../../../models/userModel");
const httpMocks = require("node-mocks-http");

jest.mock("../../../models/userModel");
describe("getUserByUserId Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return 400 if userId is not provided", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      params: {},
    });
    const res = httpMocks.createResponse();

    await addVisit(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: "User ID is required" });
  });

  it("should return 400 if userId is not provided", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      params: {},
    });
    const res = httpMocks.createResponse();

    await addVisit(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: "User ID is required" });
  });
  it("should return 404 if user is not found", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      params: { userId: "12345" },
    });
    const res = httpMocks.createResponse();

    User.findById.mockResolvedValue(null);

    await addVisit(req, res);

    expect(User.findById).toHaveBeenCalledWith("12345");
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: "User not found" });
  });
  it("should add a visit and return updated visits list", async () => {
    const mockUser = {
      _id: "12345",
      visits: [],
      save: jest.fn(),
    };

    const newVisit = {
      date: "2024-12-15",
      groupId: "group1",
      eventId: "event1",
    };

    const req = httpMocks.createRequest({
      method: "POST",
      params: { userId: "12345" },
      body: newVisit,
    });
    const res = httpMocks.createResponse();

    User.findById.mockResolvedValue(mockUser);

    await addVisit(req, res);

    expect(User.findById).toHaveBeenCalledWith("12345");
    expect(mockUser.visits).toContainEqual(newVisit);
    expect(mockUser.save).toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual(mockUser.visits);
  });

  it("should return 500 if an error occurs", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      params: { userId: "12345" },
      body: {
        date: "2024-12-15",
        groupId: "group1",
        eventId: "event1",
      },
    });
    const res = httpMocks.createResponse();

    User.findById.mockRejectedValue(new Error("Database error"));

    await addVisit(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      message: "Internal Server Error: Database error",
    });
  });
});
