const request = require("supertest");
const crypto = require("node:crypto");

const app = require("../src/app");

const database = require("../database")

let testUserId //used to have only one id for POST and DELETE tests

afterAll(() => database.end());

describe("GET /api/users", () => {
  it("should return all users", async () => {
    const response = await request(app).get("/api/users");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });
});

describe("GET /api/users/:id", () => {
  it("should return one user", async () => {
    const response = await request(app).get("/api/users/1");

    expect(response.headers["content-type"]).toMatch(/json/);

    expect(response.status).toEqual(200);
  });

  it("should return no user", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});

describe("POST /api/users", () => {
  it("should return created user", async () => {
   const newUser = {
    firstname: "Arthur",
    lastname: "Dupont",
    email: `${crypto.randomUUID()}@wild.co`,
    city: "Toulouse",
    language: "French"
  };

    const response = await request(app).post("/api/users").send(newUser);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toHaveProperty("id");
    expect(typeof response.body.id).toBe("number");

    testUserId = response.body.id;

    const [result] = await database.query(
      "SELECT * FROM users WHERE id=?",
      response.body.id
    );

    const [userInDatabase] = result;

    expect(userInDatabase).toHaveProperty("id");

    expect(userInDatabase).toHaveProperty("firstname");
    expect(userInDatabase.firstname).toStrictEqual(newUser.firstname);

    expect(userInDatabase).toHaveProperty("lastname");
    expect(userInDatabase.lastname).toStrictEqual(newUser.lastname);

    expect(userInDatabase).toHaveProperty("email");
    expect(userInDatabase.email).toStrictEqual(newUser.email);

    expect(userInDatabase).toHaveProperty("city");
    expect(userInDatabase.city).toStrictEqual(newUser.city);

    expect(userInDatabase).toHaveProperty("language");
    expect(userInDatabase.language).toStrictEqual(newUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Harry" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });
});

describe("PUT /api/users/:id", () => {
  it("should edit user", async () => {
    const newUser = {
      firstname: "Arthur",
      lastname: "Dupont",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Toulouse",
      language: "French"
    };

    const [result] = await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language) VALUE (?, ?, ?, ?, ?)",
      [newUser.firstname, newUser.lastname, newUser.email, newUser.city, newUser.language] 
    );

    const id = result.insertId;

    const updatedUser = {
      firstname: "Pascal",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French"
    };

    const response = await request(app)
      .put(`/api/users/${id}`)
      .send(updatedUser);

      expect(response.status).toEqual(204);

      const [users] = await database.query("SELECT * FROM users WHERE id=?", id);
  
      const [userInDatabase] = users;
  
      expect(userInDatabase).toHaveProperty("id");
  
      expect(userInDatabase).toHaveProperty("firstname");
      expect(userInDatabase.firstname).toStrictEqual(updatedUser.firstname);
  
      expect(userInDatabase).toHaveProperty("lastname");
      expect(userInDatabase.lastname).toStrictEqual(updatedUser.lastname);
  
      expect(userInDatabase).toHaveProperty("email");
      expect(userInDatabase.email).toStrictEqual(updatedUser.email);
  
      expect(userInDatabase).toHaveProperty("city");
      expect(userInDatabase.city).toStrictEqual(updatedUser.city);
  
      expect(userInDatabase).toHaveProperty("language");
      expect(userInDatabase.language).toStrictEqual(updatedUser.language);
  });

  it("should return an error", async () => {
    const userWithMissingProps = { firstname: "Harry" };

    const response = await request(app)
      .post("/api/users")
      .send(userWithMissingProps);

    expect(response.status).toEqual(422);
  });

  it("should return no user", async () => {
    const newUser = {
      firstname: "Pascal",
      lastname: "Martin",
      email: `${crypto.randomUUID()}@wild.co`,
      city: "Paris",
      language: "French"
    };

    const response = await request(app).put("/api/users/0").send(newUser);

    expect(response.status).toEqual(404);
  });
});

describe("DELETE /api/users/:id", () => {
  it("should delete one user", async () => {
    const response = await request(app).delete(`/api/users/${testUserId}`);

    expect(response.status).toEqual(204);

    const [result] = await database.query(
      "SELECT * FROM users WHERE id=?",
         [testUserId]
       );

    expect(result.length).toEqual(0);
  });

  it("should return an error", async () => {
    const response = await request(app).get("/api/users/0");

    expect(response.status).toEqual(404);
  });
});