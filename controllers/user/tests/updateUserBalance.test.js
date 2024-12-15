const { updateUserBalance } = require("../userController");
const { User } = require("../../../models/userModel");
const httpMocks = require("node-mocks-http");

jest.mock("../../../models/userModel");

describe("updateUserBalance", () => {
    it("should return 400 if userId is not provided", async () => {
      const req = httpMocks.createRequest({
        method: "PATCH",
        params: {},
      });
      const res = httpMocks.createResponse();
  
      await updateUserBalance(req, res);
  
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: "User ID is required" });
    });
  
    it("should return 404 if user is not found", async () => {
      const req = httpMocks.createRequest({
        method: "PATCH",
        params: { userId: "12345" },
        body: { balance: 100 },
      });
      const res = httpMocks.createResponse();
  
      User.findById.mockResolvedValue(null);
  
      await updateUserBalance(req, res);
  
      expect(User.findById).toHaveBeenCalledWith("12345");
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: "User not found" });
    });
  
    it("should return 500 if balance is invalid", async () => {
      const req = httpMocks.createRequest({
        method: "PATCH",
        params: { userId: "12345" },
        body: { balance: "invalid_balance" },
      });
      const res = httpMocks.createResponse();
  
      const mockUser = {
        _id: "12345",
        balance: 50,
        save: jest.fn(),
      };
  
      User.findById.mockResolvedValue(mockUser);
  
      await updateUserBalance(req, res);
  
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Internal Server Error: Invalid balance value",
      });
    });
  
    it("should update balance and return updated balance", async () => {
      const mockUser = {
        _id: "12345",
        balance: 50,
        save: jest.fn(),
      };
  
      const req = httpMocks.createRequest({
        method: "PATCH",
        params: { userId: "12345" },
        body: { balance: 100 },
      });
      const res = httpMocks.createResponse();
  
      User.findById.mockResolvedValue(mockUser);
  
      await updateUserBalance(req, res);
  
      expect(User.findById).toHaveBeenCalledWith("12345");
      expect(mockUser.balance).toBe(100);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Balance updated successfully",
        balance: 100,
      });
    });
  
    it("should return 500 if an error occurs", async () => {
      const req = httpMocks.createRequest({
        method: "PATCH",
        params: { userId: "12345" },
        body: { balance: 100 },
      });
      const res = httpMocks.createResponse();
  
      User.findById.mockRejectedValue(new Error("Database error"));
  
      await updateUserBalance(req, res);
  
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: "Internal Server Error: Database error",
      });
    });
  });
  