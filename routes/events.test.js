const request = require("supertest");
const express = require("express");
const router = require("./events");
const { schemas } = require("../models/eventModel");
const validateBody = require("../middlevares/vaidateBody");
const controllers = require("../controllers/event/eventsController");

const app = express();
app.use(express.json());
app.use("/events", router);

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  // Создание в памяти MongoDB
  mongoServer = await MongoMemoryServer.create();

  // Установка URI для Mongoose
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Закрытие соединения и удаление базы данных в памяти
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("GET /events", () => {
  it("should retrieve all events", async () => {
    const res = await request(app).get("/events");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe("GET /events/:eventId", () => {
  it("should retrieve a specific event by ID", async () => {
    // Пример создания события перед тестированием
    const newEvent = {
      groupTitle: "groupTitle 1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };

    const createdEventRes = await request(app)
      .post("/events")
      .send(newEvent)
      .set("Accept", "application/json");

    // Check if the event was created successfully
    expect(createdEventRes.status).toBe(201);
    const eventId = createdEventRes.body._id; // _id should be included after creation

    // Now try to get the event by its ID
    const res = await request(app).get(`/events/${eventId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", eventId); // Ensure the _id property matches the ID of the created event
  });
});

describe("POST /events", () => {
  it("should create a new event with valid data", async () => {
    const newEvent = {
      groupTitle: "groupTitle 1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    const res = await request(app)
      .post("/events")
      .send(newEvent)
      .set("Accept", "application/json");
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newEvent);
  });

  it("should return 400 for missing required fields", async () => {
    const invalidEvent = { groupTitle: "groupTitle 1", groupId: "1" };

    const res = await request(app)
      .post("/events")
      .send(invalidEvent)
      .set("Accept", "application/json");

    console.log("Response status:", res.status);
    console.log("Response body:", res.body);

    expect(res.status).toBe(400); // Убедитесь, что сервер возвращает 400
  });
});

describe("PUT /events/:eventId", () => {
  it("should update an existing event", async () => {
    // Пример создания события перед тестированием
    const newEvent = {
      groupTitle: "groupTitle 1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    debugger;
    const createdEventRes = await request(app)
      .post("/events")
      .send(newEvent)
      .set("Accept", "application/json");
    debugger;
    const eventId = createdEventRes.body._id;
    debugger;
    console.log(createdEventRes.body, "createdEventRes.body");
    console.log(eventId, "eventId");
    debugger;
    const updatedEvent = {
      _id: eventId,
      date: createdEventRes.body.date,
      groupId: createdEventRes.body.groupId,
      isCancelled: createdEventRes.body.isCancelled,
      participants: createdEventRes.body.participants,
      groupTitle: "Updated Event Title",
    };
    debugger;
    const res = await request(app)
      .put(`/events/${eventId}`)
      .send(updatedEvent)
      .set("Accept", "application/json");
    debugger;
    expect(res.status).toBe(200);
    expect(res.body.groupTitle).toBe(updatedEvent.groupTitle);
  });
});

describe("DELETE /events/:eventId", () => {
  it("should delete an existing event", async () => {
    const newEvent = {
      groupTitle: "groupTitle 1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    debugger;
    const createdEventRes = await request(app)
      .post("/events")
      .send(newEvent)
      .set("Accept", "application/json");
    debugger;
    const eventId = createdEventRes.body._id;
    debugger;
    console.log(createdEventRes.body, "createdEventRes.body");
    console.log(eventId, "eventId");
    debugger;

    const res = await request(app).delete(`/events/${eventId}`);
    expect(res.status).toBe(200);
  });
});
