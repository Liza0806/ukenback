const { isGroupScheduleSuitable } = require("./validators");
const Joi = require("joi");
const { Group } = require("../models/groupModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
jest.mock("../models/groupModel.js", () => ({
  Group: {
    find: jest.fn().mockReturnThis(), // Chainable find mock
    exec: jest.fn().mockResolvedValue([]), // Mocked exec method resolving with an empty array
  },
}));

// Tests
describe("isGroupScheduleSuitable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null if the schedule is suitable", async () => {
    Group.exec.mockResolvedValueOnce([]); // Mock an empty result indicating no existing groups
    const schedule = [{ day: "Monday", time: "18:00" }];
    const result = await isGroupScheduleSuitable(schedule);
    expect(result).toBe(null);
  });

  it("should return conflict message if there is a schedule conflict", async () => {
    const existingGroup = {
      title: "Existing Group",
      schedule: [{ day: "Monday", time: "18:00" }],
    };
    Group.exec.mockResolvedValue([existingGroup]); // Mock an existing group with a conflicting schedule
    const schedule = [{ day: "Monday", time: "18:00" }];

    const result = await isGroupScheduleSuitable(schedule);

    expect(result).toBe(
      `Conflict detected: {"day":"Monday","time":"18:00"} exists in group 'Existing Group'`
    );
  });

  it("should throw an error on failure", async () => {
    Group.exec.mockRejectedValue("Database error"); // Simulate a database error
    const schedule = [{ day: "Monday", time: "18:00" }];

    await expect(isGroupScheduleSuitable(schedule)).rejects.toThrow(
      "Error checking schedule suitability"
    );
  });
});
