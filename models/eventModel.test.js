const mongoose = require('mongoose');
const { Event } = require('./eventModel');
const { DB_HOST } = require('../config');
describe('Event Model', () => {
  beforeAll(async () => {
    await mongoose.connect(DB_HOST);
  });

  afterAll(async () => {
   // await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should save a valid event', async () => {
    const validEvent = new Event({
      _id: "1",
      date: "2024-12-31T10:00:00.000Z",
      groupTitle: "Group A",
      groupId: "g1",
      participants: [{ id: "u1", name: "John Doe", telegramId: "123456" }]
    });

    const savedEvent = await validEvent.save();
    expect(savedEvent._id).toBe("1");
    expect(savedEvent.isCancelled).toBe(false); // Default value
    expect(savedEvent.participants).toHaveLength(1);
    expect(savedEvent.createdAt).toBeDefined();
    expect(savedEvent.updatedAt).toBeDefined();
  });

  it('should throw validation error for missing required fields', async () => {
    const invalidEvent = new Event({
      date: "2024-12-31T10:00:00.000Z", // Missing `_id`, `groupTitle`, and `groupId`
    });

    await expect(invalidEvent.save()).rejects.toThrow();
  });
});

const { schemas } = require('./eventModel');

describe('Joi Validation for Event', () => {
  const validEvent = {
    _id: "1",
    date: "2024-12-31T10:00:00.000Z",
    groupTitle: "Group A",
    groupId: "g1",
    isCancelled: false,
    participants: [{ id: "u1", name: "John Doe", telegramId: "123456" }],
  };

  it('should validate a valid event object', () => {
    const { error, value } = schemas.eventSchemaJoi.validate(validEvent);
    expect(error).toBeUndefined();
    expect(value).toEqual(validEvent);
  });

  it('should throw error if required fields are missing', () => {
    const invalidEvent = {
      date: "2024-12-31T10:00:00.000Z", // Missing `_id`, `groupTitle`, and `groupId`
    };

    const { error } = schemas.eventSchemaJoi.validate(invalidEvent);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/_id is required/);
  });

  it('should throw error if date is not in ISO format', () => {
    const invalidEvent = {
      ...validEvent,
      date: "12/31/2024", // Invalid date format
    };

    const { error } = schemas.eventSchemaJoi.validate(invalidEvent);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/must be in ISO 8601 date format/);
  });

  it('should set default values for missing optional fields', () => {
    const eventWithoutDefaults = {
      _id: "2",
      date: "2024-12-31T10:00:00.000Z",
      groupTitle: "Group B",
      groupId: "g2",
    };

    const { error, value } = schemas.eventSchemaJoi.validate(eventWithoutDefaults);
    expect(error).toBeUndefined();
    expect(value.isCancelled).toBe(false); 
    expect(value.participants).toEqual([]); 
  });
});
