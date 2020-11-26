describe("Jest works", () => {
  it("Testing to see if Jest works", () => {
    expect(2).toBe(2);
  });
  
  it("Jest should use the test DB", () => {
    expect(process.env.DB_DATABASE).toBe("test_db");
  });
})

