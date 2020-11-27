const request = require("supertest");
const app = require("../app");
const btoa = require("../helpers/btoa");

const mockUser = {
  username: "unique_112233",
  fullName: "Full Name",
  email: "unique_email@example.com",
  country: "Country",
  postcode: "XX1XX5",
  address: "1 Address, Street",
  city: "City",
};

const password = "password";
const token = btoa(mockUser.username + ":" + password);
const token2 = btoa("user1:" + password);

describe("Post new user", () => {
  it("should create a new user", async () => {
    const res = await request(app.callback())
      .post("/api/v1/users")
      .send({ ...mockUser, password: "password" });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("created", true);

    const { ID } = res.body;
    const user = await request(app.callback())
      .get(`/api/v1/users/${ID}`)
      .set("Authorization", "Basic " + token);
    expect(user.body).toEqual(expect.objectContaining(mockUser));
  });

  it("should authenticate user", async () => {
    const res = await request(app.callback())
      .post("/api/v1/users/login")
      .set("Authorization", "Basic " + token);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("username", mockUser.username);
  });
});

describe("Retrieve users", () => {
  it("should retrieve user by ID", async () => {
    const res = await request(app.callback())
      .get(`/api/v1/users/4`)
      .set("Authorization", "Basic " + token);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expect.objectContaining(mockUser));
  });
});

describe("Secured routes", () => {
  it("should not allow unauthenticated user to read by id", async () => {
    const res = await request(app.callback())
    .get(`/api/v1/users/4`)
    expect(res.statusCode).toEqual(401);
  })

  it("should not allow unauthenticated user to delete by id", async () => {
    const res = await request(app.callback())
    .del(`/api/v1/users/4`)
    expect(res.statusCode).toEqual(401);
  })

  it("should not allow unauthenticated user to update by id", async () => {
    const res = await request(app.callback())
    .put(`/api/v1/users/4`)
    .send({username: 'Hey'})
    expect(res.statusCode).toEqual(401);
  })

  it("should only allow account owner to update", async () => {
    const res = await request(app.callback())
    .put(`/api/v1/users/4`)
    .set("Authorization", "Basic " + token2)
    .send({...mockUser, fullName: 'user99', username: undefined})
    expect(res.statusCode).toEqual(403);
  })

  it("should only allow account owner to delete", async () => {
    const res = await request(app.callback())
    .del(`/api/v1/users/4`)
    .set("Authorization", "Basic " + token2)
    expect(res.statusCode).toEqual(403);
  })
})