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

const mockRequest = {
  title: 'A request',
  requesterID: 2,
  bookID: 1
}

const password = "password";
const user1token = btoa(mockUsers[0].username + ":" + password);
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

describe("Make a new request", () => {
  it("should create a new request", async () => {
    const res = await request(app.callback())
      .post("/api/v1/requests")
      .set("Authorization", "Basic " + user2token)
      .send(mockRequest);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("created", true);

    const { ID } = res.body;
    const bookRequest = await request(app.callback())
      .get(`/api/v1/requests/${ID}`)
      .set("Authorization", "Basic " + user2token);
    expect(bookRequest.statusCode).toEqual(200);
    expect(bookRequest.body).toEqual(expect.objectContaining(mockRequest));
  });
});

describe("Retrieve a request", () => {
  it("should retrieve a requests by ID", async () => {
    const res = await request(app.callback())
      .get("/api/v1/requests/1")
      .set("Authorization", "Basic " + user2token)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Request title');
  });

  it("should retrieve a requests by user ID", async () => {
    const res = await request(app.callback())
      .get("/api/v1/requests/user/2")
      .set("Authorization", "Basic " + user2token)
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toHaveProperty('title', 'Request title');
  });
});

describe("Archive a request", () => {
  it("should archive requester request", async () => {
    const res = await request(app.callback())
      .post("/api/v1/requests/archive/1")
      .set("Authorization", "Basic " + user2token)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("updated", true);
    const bookRequest = await request(app.callback())
      .get(`/api/v1/requests/1`)
      .set("Authorization", "Basic " + user2token);
    expect(bookRequest.statusCode).toEqual(200);
    expect(bookRequest.body).toEqual(expect.objectContaining({isArchivedByRequester: 1}));
  });

  it("should archive receiver request", async () => {
    const res = await request(app.callback())
      .post("/api/v1/requests/archive/1")
      .set("Authorization", "Basic " + user1token)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("updated", true);

    const bookRequest = await request(app.callback())
      .get(`/api/v1/requests/1`)
      .set("Authorization", "Basic " + user1token);
    expect(bookRequest.statusCode).toEqual(200);
    expect(bookRequest.body).toEqual(expect.objectContaining({isArchivedByReceiver: 1}));
  });
});

describe("Delete request", () => {
  it("should delete a request by ID", async () => {
    const res = await request(app.callback())
      .del("/api/v1/requests/1")
      .set("Authorization", "Basic " + user2token)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('deleted', true);
  
    const deletedBook = await request(app.callback())
    .get("/api/v1/requests/1")
    .set("Authorization", "Basic " + user2token)
    expect(deletedBook.statusCode).toEqual(200);
    expect(deletedBook.body).toStrictEqual({})
  });
});