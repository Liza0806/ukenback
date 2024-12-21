const request = require("supertest");
const express = require("express");
const router = require("./user");
const { schemas } = require("../models/userModel");
const validateBody = require("../middlevares/vaidateBody");
const controllers = require("../controllers/user/userController");

const app = express();
app.use(express.json());
app.use("/users", router);

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

describe("GET /users", () => {
  it("should retrieve all users", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe("GET /users/:userId", () => {
  it("should retrieve a specific event by ID", async () => {
    // Пример создания события перед тестированием
    const newUser =  {
       // _id: "1",
        name: "userName 1",
        password: "111222",
        phone: "+3802211111",
        isAdmin: false,
        groups: [],
        balance: 11,
        telegramId: 111,
        discount: 11,
        visits: [],
      };

    const createdUserRes = await request(app)
      .post("/users")
      .send(newUser)
      .set("Accept", "application/json");
debugger
    // Check if the event was created successfully
    expect(createdUserRes.status).toBe(201);
    const userId = createdUserRes.body._id; // _id should be included after creation
debugger
    // Now try to get the event by its ID
    const res = await request(app).get(`/users/${userId}`);
    debugger
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", userId); // Ensure the _id property matches the ID of the created event
  });
});

describe("POST /users", () => {
  it("should create a new user with valid data", async () => {
    const newUser =  {
        // _id: "1",
         name: "userName 1",
         password: "111222",
         phone: "+3802211111",
         isAdmin: false,
         groups: [],
         balance: 11,
         telegramId: 111,
         discount: 11,
         visits: [],
       };
       const createdUser =  {
         name: "userName 1",
         phone: "+3802211111",
         isAdmin: false,
         groups: [],
         balance: 11,
         telegramId: 111,
         discount: 11,
         visits: [],
       };
    const res = await request(app)
      .post("/users")
      .send(newUser)
      .set("Accept", "application/json");
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(createdUser);
  });

  it("should return 400 for missing required fields", async () => {
    const invalidUser = {   name: "userName 1",
        phone: "+3802211111",
        isAdmin: false, };

    const res = await request(app)
      .post("/users")
      .send(invalidUser)
      .set("Accept", "application/json");

    console.log("Response status:", res.status);
    console.log("Response body:", res.body);

    expect(res.status).toBe(400); 
  });
});

describe("PUT /users/:userId", () => {
  it("should update an existing user", async () => {
    const newUser =  {
      // _id: "1",
       name: "userName 1",
       password: "111222",
       phone: "+3802211111",
       isAdmin: false,
       groups: [],
       balance: 11,
       telegramId: 111,
       discount: 11,
       visits: [],
     };
  
  const createdUsertRes = await request(app)
    .post("/users")
    .send(newUser)
    .set("Accept", "application/json");
    debugger;
    const userId = createdUsertRes.body._id;
    debugger;
    console.log(createdUsertRes.body, "createdEventRes.body");
    console.log(userId, "userId");
    debugger;
    const updatedUser =  {
       _id: userId,
       name: "updatedUserName",
       password: "111222333",
       phone: "+3802211111",
       isAdmin: false,
       groups: [],
       balance: 11,
       telegramId: 111,
       discount: 11,
       visits: [],
     };
    debugger;
    const res = await request(app)
      .put(`/users/${userId}`)
      .send(updatedUser)
      .set("Accept", "application/json");
    debugger;
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(updatedUser.name);
  });
});

describe("DELETE /users/:userId", () => {
  it("should delete an existing user", async () => {
    const newUser =  {
        // _id: "1",
         name: "userName 1",
         password: "111222",
         phone: "+3802211111",
         isAdmin: false,
         groups: [],
         balance: 11,
         telegramId: 111,
         discount: 11,
         visits: [],
       };
    debugger;
    const createdUserRes = await request(app)
      .post("/users")
      .send(newUser)
      .set("Accept", "application/json");
    debugger;
    const userId = createdUserRes.body._id;
    debugger;
    console.log(createdUserRes.body, "createdEventRes.body");
    console.log(userId, "userId");
    debugger;

    const res = await request(app).delete(`/users/${userId}`);
    expect(res.status).toBe(200);
  });
});
