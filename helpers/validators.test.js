const {
  validateData,
  isValidGroupData,
  isGroupAlreadyExist,
} = require("./validators");
const Joi = require("joi");
const { Group } = require("../models/groupModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
jest.mock("../models/groupModel.js", () => ({
  Group: {
    findOne: jest.fn(),
    find: jest.fn(),
  },
}));

describe("validateData", () => {
  const schema = Joi.object({
    title: Joi.string().required(),
    coachId: Joi.string().required(),
    payment: Joi.array().items(Joi.object()).required(),
    schedule: Joi.array()
      .items(
        Joi.object({
          day: Joi.string().required(),
          time: Joi.string().required(),
        })
      )
      .required(),
    participants: Joi.array().items(Joi.object()).required(),
  });

  it("should validate data correctly", () => {
    const validData = {
      title: "Boxing Class",
      coachId: "603fbebe23e6d004b50a4887",
      payment: [{ dailyPayment: 100, monthlyPayment: 300 }],
      schedule: [{ day: "Monday", time: "18:00" }],
      participants: [],
    };

    const result = validateData(schema, validData);

    expect(result).toEqual(validData);
  });

  it("should throw an error for invalid data", () => {
    const invalidData = {
      title: "",
      coachId: 123, // should be a string
      payment: "invalid_payment_format", // should be an array
      schedule: "invalid_schedule_format", // should be an array of objects
      participants: "invalid_participants_format", // should be an array
    };

    expect(() => validateData(schema, invalidData)).toThrow(
      /Validation error:/
    );
  });
});

/////////////////////////////////////////////////////////////

describe("isValidGroupData", () => {
  it("should return true for valid group data", () => {
    const validData = {
      title: "Boxing Class",
      coachId: "603fbebe23e6d004b50a4887",
      payment: [{ dailyPayment: 100, monthlyPayment: 300 }],
      schedule: [{ day: "Monday", time: "18:00" }],
      participants: [],
    };

    const result = isValidGroupData(validData);

    expect(result).toBe(true);
  });

  it("should return false for invalid group data", () => {
    const invalidData = {
      title: "",
      coachId: 123, // should be a string
      payment: "invalid_payment_format", // should be an array
      schedule: "invalid_schedule_format", // should be an array of objects
      participants: "invalid_participants_format", // should be an array
    };

    const result = isValidGroupData(invalidData);

    expect(result).toBe(false);
  });
});

/////////////////////////////////////////////////////////////////////////

describe("isGroupAlreadyExist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if the group exists", async () => {
    Group.findOne.mockResolvedValue({ title: "Boxing Class" });
    const data = { title: "Boxing Class" };

    const result = await isGroupAlreadyExist(data);

    expect(result).toBe(true);
    expect(Group.findOne).toHaveBeenCalledWith({ title: data.title });
  });

  it("should return false if the group does not exist", async () => {
    Group.findOne.mockResolvedValue(null);
    const data = { title: "Nonexistent Group" };

    const result = await isGroupAlreadyExist(data);

    expect(result).toBe(false);
    expect(Group.findOne).toHaveBeenCalledWith({ title: data.title });
  });

  it("should throw an error on failure", async () => {
    Group.findOne.mockRejectedValue(new Error("Database error"));
    const data = { title: "Error Group" };

    await expect(isGroupAlreadyExist(data)).rejects.toThrow(
      "Failed to check if group exists"
    );
  });
});
