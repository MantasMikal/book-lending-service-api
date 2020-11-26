const request = require("supertest");
const app = require("../app");

const mockUser = {
  username: "unique_112233",
  fullName: 'Full Name',
  email: "unique_email@example.com",
  country: 'Country',
  postcode: 'XX1XX5',
  address: '1 Address, Street',
  city: 'City'
}

const password = 'password'
describe("Post new user", () => {
  it("should create a new user", async () => {
    const res = await request(app.callback())
      .post("/api/v1/users")
      .send({...mockUser, password: "password"});
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("created", true);
  });

  it("should correctly insert user", async () => {
    const res = await request(app.callback())
      .get("/api/v1/users/1")
      console.log("🚀 ~ file: userRoutes.test.js ~ line 25 ~ it ~ res", res)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toBe(mockUser)
  })
});
