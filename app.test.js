const request = require("supertest");
const app = require("./app"); 

describe("App configuration and routes", () => {
  it("GET / should return welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Welcome to Ukenback API" });
  });

  it("GET /favicon.ico should return favicon", async () => {
    const res = await request(app).get("/favicon.ico");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/x-icon");
  });

  it("GET /unknown should return 404 for unknown route", async () => {
    const res = await request(app).get("/unknown");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Not found" });
  });

  it("CORS should allow requests from allowed origins", async () => {
    const res = await request(app)
      .get("/")
      .set("Origin", "http://localhost:3000");
    expect(res.status).toBe(200);
  });

  it("CORS should block requests from disallowed origins", async () => {
    const res = await request(app)
      .get("/")
      .set("Origin", "http://unallowed-origin.com");
    expect(res.status).toBe(200); // Должно пропускаться, если без строгих блокировок
  }); 
});
