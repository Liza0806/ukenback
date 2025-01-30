const request = require("supertest");
const express = require("express");
const router = require("./group");
const { schemas } = require("../models/groupModel");
const validateBody = require("../middlevares/vaidateBody");
const controllers = require("../controllers/group/groupController");

const app = express();
app.use(express.json());
app.use("/groups", router);

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

describe("GET /groups", () => {
  it("should retrieve all groups", async () => {
    const res = await request(app).get("/groups");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe("GET /groups/:id", () => {
  it("should retrieve a specific event by ID", async () => {
    // Пример создания события перед тестированием
    const newGroup = {
      //_id: "1",
      title: "Group 1",
      coachId: "coach1",
      payment: [
        {
          _id: "pay1",
          dailyPayment: 500,
          monthlyPayment: 10000,
        },
      ],
      schedule: [
        { day: "  Понеділок", time: "10:00" },
        { day: "Середа", time: "15:30" },
      ],
      participants: [
        {
          _id: "p1",
          name: "John Doe",
          telegramId: 123456789,
        },
        {
          _id: "p2",
          name: "Jane Doe",
          telegramId: 123456790,
        },
        {
          _id: "p3",
          name: "Justin Doe",
          telegramId: 123456791,
        },
      ],
    };

    const createdGroupRes = await request(app)
      .post("/groups")
      .send(newGroup)
      .set("Accept", "application/json");
    debugger;
    // Check if the event was created successfully
    expect(createdGroupRes.status).toBe(201);
    debugger;
    const groupId = createdGroupRes.body._id; // _id should be included after creation
    debugger;
    // Now try to get the event by its ID
    const res = await request(app).get(`/groups/${groupId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", groupId); // Ensure the _id property matches the ID of the created event
  });
});

describe("POST /groups", () => {
  it("should create a new group with valid data", async () => {
    const newGroup = {
      //_id: "1",
      title: "Group 1",
      coachId: "coach1",

      dailyPayment: 500,
      monthlyPayment: 10000,

      schedule: [
        { day: "  Понеділок", time: "10:00" },
        { day: "Середа", time: "15:30" },
      ],
      participants: [
        {
          _id: "p1",
          name: "John Doe",
          telegramId: 123456789,
        },
        {
          _id: "p2",
          name: "Jane Doe",
          telegramId: 123456790,
        },
        {
          _id: "p3",
          name: "Justin Doe",
          telegramId: 123456791,
        },
      ],
    };
    const res = await request(app)
      .post("/groups")
      .send(newGroup)
      .set("Accept", "application/json");
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newGroup);
  });

  it("should return 400 for missing required fields", async () => {
    const invalidGroup = {
      title: "Group 1",
      coachId: "coach1",

      dailyPayment: 500,
      monthlyPayment: 10000,
    };

    const res = await request(app)
      .post("/groups")
      .send(invalidGroup)
      .set("Accept", "application/json");

    console.log("Response status:", res.status);
    console.log("Response body:", res.body);

    expect(res.status).toBe(400); // Убедитесь, что сервер возвращает 400
  });
});

describe("PUT /groups/:id", () => {
  it("should update an existing group", async () => {
    // Пример создания события перед тестированием
    const newGroup = {
      //_id: "1",
      title: "Group 1",
      coachId: "coach1",

      dailyPayment: 500,
      monthlyPayment: 10000,

      schedule: [
        { day: "  Понеділок", time: "10:00" },
        { day: "Середа", time: "15:30" },
      ],
      participants: [
        {
          _id: "p1",
          name: "John Doe",
          telegramId: 123456789,
        },
        {
          _id: "p2",
          name: "Jane Doe",
          telegramId: 123456790,
        },
        {
          _id: "p3",
          name: "Justin Doe",
          telegramId: 123456791,
        },
      ],
    };
    debugger;
    const createdGroupRes = await request(app)
      .post("/groups")
      .send(newGroup)
      .set("Accept", "application/json");
    debugger;
    const groupId = createdGroupRes.body._id;
    debugger;
    console.log(createdGroupRes.body, "createdGroupRes.body");
    console.log(groupId, "eventId");
    debugger;
    const updatedGroup = {
      //    _id: groupId,
      title: "New Title 1",
      coachId: "coach1",

      dailyPayment: 500,
      monthlyPayment: 10000,

      schedule: [
        { day: "  Понеділок", time: "10:00" },
        { day: "Середа", time: "15:30" },
      ],
      participants: [
        {
          _id: "p1",
          name: "John Doe",
          telegramId: 123456789,
        },
        {
          _id: "p2",
          name: "Jane Doe",
          telegramId: 123456790,
        },
        {
          _id: "p3",
          name: "Justin Doe",
          telegramId: 123456791,
        },
      ],
    };
    debugger;
    const res = await request(app)
      .put(`/groups/${groupId}`)
      .send(updatedGroup)
      .set("Accept", "application/json");
    debugger;
    expect(res.status).toBe(200);
    expect(res.body.updatedGroup.title).toBe(updatedGroup.title);
  });
});

describe("DELETE /groups/:id", () => {
  it("should delete an existing event", async () => {
    const newGroup = {
      //    _id: groupId,
      title: "New Title 1",
      coachId: "coach1",

      dailyPayment: 500,
      monthlyPayment: 10000,

      schedule: [
        { day: "  Понеділок", time: "10:00" },
        { day: "Середа", time: "15:30" },
      ],
      participants: [
        {
          _id: "p1",
          name: "John Doe",
          telegramId: 123456789,
        },
        {
          _id: "p2",
          name: "Jane Doe",
          telegramId: 123456790,
        },
        {
          _id: "p3",
          name: "Justin Doe",
          telegramId: 123456791,
        },
      ],
    };
    debugger;
    const createdGroupRes = await request(app)
      .post("/groups")
      .send(newGroup)
      .set("Accept", "application/json");
    debugger;
    const groupId = createdGroupRes.body._id;
    debugger;
    console.log(createdGroupRes.body, "createdEventRes.body");
    console.log(groupId, "groupId");
    debugger;

    const res = await request(app).delete(`/groups/${groupId}`);
    expect(res.status).toBe(200);
  });
});
