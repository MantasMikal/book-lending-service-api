const request = require("supertest");
const app = require("../app");
const btoa = require("../helpers/btoa");
const runPreTest = require("../helpers/runPreTest")

// Exists in db
const mockUsers = [
  {
    username: "user1",
    ID: 1,
  },
  {
    username: "user2",
    ID: 2,
  },
];

const password = "password";
const user1token = btoa(mockUsers[0].username + ":" + password);

beforeEach((done) => {
  runPreTest(done)
});

describe("Search books", () => {
  it("should search all books", async () => {
    const res = await request(app.callback())
      .get("/api/v1/search/books?q=Lorem")
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1)
    expect(res.body[0]).toHaveProperty('ID', 1)
  });

  it("should search user books", async () => {
    const res = await request(app.callback())
      .get("/api/v1/search/books?q=Lorem&userID=1")
      .set("Authorization", "Basic " + user1token)
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1)
    expect(res.body[0]).toHaveProperty('ID', 1)
  });
});
