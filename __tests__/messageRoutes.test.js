const request = require("supertest");
const app = require("../app");
const btoa = require("../helpers/btoa");
const { exec } = require("child_process");

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

const mockMessage = {
  message: 'Mock message',
  requestID: 1,
  senderID: 1,
  receiverID: 2 
}

const password = "password";
const user2token = btoa(mockUsers[1].username + ":" + password);

beforeEach((done) => {
  const p = exec("npm run pretest", (error, stdout) => {
    if (error) {
      throw Error(error)
    }
  });
  p.on('close', () => {
    done()
  })
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
    expect(requestMessages.body[1]).toEqual(expect.objectContaining(mockMessage));
  });
});

describe("Retrieve messages", () => {
  it("should retrieve request messages", async () => {
    const res = await request(app.callback())
      .get("/api/v1/messages/1")
      .set("Authorization", "Basic " + user2token)
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1)
    expect(res.body[0]).toHaveProperty('ID', 1)
  });
});
