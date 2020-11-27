const request = require("supertest");
const app = require("../app");
const btoa = require("../helpers/btoa");
const runPreTest = require("../helpers/runPreTest");

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
  {
    username: "user3",
    ID: 3,
  },
];

const mockMessage = {
  message: "Mock message",
  requestID: 1,
  senderID: 1,
  receiverID: 2,
};

const password = "password";
const user2token = btoa(mockUsers[1].username + ":" + password);
const user3token = btoa(mockUsers[2].username + ":" + password);

beforeEach((done) => {
  runPreTest(done);
});

describe("Create a new message", () => {
  it("should create a new message", async () => {
    const res = await request(app.callback())
      .post("/api/v1/messages")
      .set("Authorization", "Basic " + user2token)
      .send(mockMessage);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("created", true);

    const requestMessages = await request(app.callback())
      .get(`/api/v1/messages/${mockMessage.requestID}`)
      .set("Authorization", "Basic " + user2token);
    expect(requestMessages.statusCode).toEqual(200);
    expect(requestMessages.body[1]).toEqual(
      expect.objectContaining(mockMessage)
    );
  });
});

describe("Retrieve messages", () => {
  it("should retrieve request messages", async () => {
    const res = await request(app.callback())
      .get("/api/v1/messages/1")
      .set("Authorization", "Basic " + user2token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toHaveProperty("ID", 1);
  });
});

describe("Secured routes and roles", () => {
  it("should not allow unauthenticated user to post a message", async () => {
    const res = await request(app.callback())
      .post("/api/v1/messages")
      .send(mockMessage);
    expect(res.statusCode).toEqual(401);
  });

  it("should not allow unauthenticated user to read messages", async () => {
    const res = await request(app.callback()).get("/api/v1/messages/1");
    expect(res.statusCode).toEqual(401);
  });

  it("should only allow participant in a request to post messages", async () => {
    const res = await request(app.callback())
      .post("/api/v1/messages")
      .set("Authorization", "Basic " + user3token)
      .send(mockMessage);
    expect(res.statusCode).toEqual(403);
  });

  it("should only allow participant in a request to read messages", async () => {
    const res = await request(app.callback())
      .get("/api/v1/messages/1")
      .set("Authorization", "Basic " + user3token);
    expect(res.statusCode).toEqual(403);
  });
});
