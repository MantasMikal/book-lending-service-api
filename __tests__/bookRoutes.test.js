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

const mockBook = {
  title: "Book",
  summary: "A summary",
  author: "Mantas",
  yearPublished: "2019",
  ownerID: 1,
};

const password = "password";
const token = btoa(mockUsers[0].username + ":" + password);

beforeEach((done) => {
  const p = exec("npm run pretest", (error) => {
    if (error) {
      throw Error(error)
    }
  });
  p.on('close', () => {
    done()
  })
});

describe("Post new book", () => {
  it("should create a new book", async () => {
    const res = await request(app.callback())
      .post("/api/v1/books")
      .set("Authorization", "Basic " + token)
      .send(mockBook);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("created", true);

    const { ID } = res.body;
    const book = await request(app.callback())
      .get(`/api/v1/books/${ID}`)
      .set("Authorization", "Basic " + token);
    expect(book.statusCode).toEqual(200);
    expect(book.body).toEqual(expect.objectContaining(mockBook));
  });
});

describe("Retrieve books", () => {
  it("should retrieve all books", async () => {
    const res = await request(app.callback()).get("/api/v1/books");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
  });

  it("should retrieve book by id", async () => {
    const res = await request(app.callback()).get("/api/v1/books/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("ID", 1);
  });

  it("should retrieve books by user ID", async () => {
    const res = await request(app.callback()).get("/api/v1/books/user/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
  });
});

describe("Update books", () => {
  it("should update book", async () => {
    const res = await request(app.callback())
      .put("/api/v1/books/1")
      .set("Authorization", "Basic " + token)
      .send({ ...mockBook, title: "Renamed book" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("updated", true);
  
    const updatedBook = await request(app.callback()).get("/api/v1/books/1");
    expect(updatedBook.statusCode).toEqual(200);
    expect(updatedBook.body).toEqual(
      expect.objectContaining({ title: "Renamed book" })
    );
  });


  it("should update book status", async () => {
    const res = await request(app.callback())
      .post("/api/v1/books/status/1")
      .set("Authorization", "Basic " + token)
      .send({ status: "Requested" });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("updated", true);

    const updatedBook = await request(app.callback()).get("/api/v1/books/1");
    expect(updatedBook.statusCode).toEqual(200);
    expect(updatedBook.body).toEqual(
      expect.objectContaining({ status: "Requested" })
    );
  });
});

describe("Delete a book", () => {
  it("should delete a book", async () => {
    const res = await request(app.callback())
      .del("/api/v1/books/1")
      .set("Authorization", "Basic " + token);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("deleted", true);

    const deletedBook = await request(app.callback()).get("/api/v1/books/1");
    expect(deletedBook.statusCode).toEqual(200);
    expect(deletedBook.body).toEqual([]);
  });
});
