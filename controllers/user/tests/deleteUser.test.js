const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { deleteUser } = require("../userController");
const { User } = require("../../../models/userModel");

jest.mock("../../../models/userModel.js");

describe("deleteUser Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should return 400 if userId is missing from request parameters", async () => {
    const req = httpMocks.createRequest({
      params: {},
    });
    const res = httpMocks.createResponse();
  
    await deleteUser(req, res);
  
    expect(res.statusCode).toBe(400);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: "User ID is required",
    });
  });
  it("should return 404 if user is not found", async () => {
    const req = httpMocks.createRequest({
      params: { userId: "1" },
    });
    const res = httpMocks.createResponse();

    User.findByIdAndDelete.mockResolvedValue(null);

    await deleteUser(req, res);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith(req.params.userId);
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: "User not found" });
  });

  it("should delete user", async () => {
    const req = httpMocks.createRequest({
      params: { userId: "1" }, 
    });
    const res = httpMocks.createResponse();
 
    User.findByIdAndDelete = jest.fn().mockResolvedValueOnce({ _id: "1" });
  
    await deleteUser(req, res);
  
    expect(User.findByIdAndDelete).toHaveBeenCalledWith("1");
  
    expect(res.statusCode).toBe(200);
  
    expect(res._getJSONData()).toEqual({
      message: "User successfully deleted",
    });
  });
  

  it("should return 500 if an error occurs during user deletion", async () => {
    const req = httpMocks.createRequest({
        params: { userId: "1" },
      });
      const res = httpMocks.createResponse();

    User.findByIdAndDelete.mockRejectedValue(
      new Error("Group deletion error")
    );

    await deleteUser(req, res);
    expect(User.findByIdAndDelete).toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: "Internal Server Error: Group deletion error" });
  });
  
});
