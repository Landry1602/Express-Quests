const express = require("express");

const { validateUser } = require("./middlewares/validateUser");
const { validateMovie } = require("./middlewares/validateMovie");

const { hashPassword } = require("./middlewares/auth.js");

const app = express();

app.use(express.json());

const movieControllers = require("./controllers/movieControllers");
const userControllers = require("./controllers/userControllers");

app.get("/api/movies", movieControllers.getMovies);
app.get("/api/movies/:id", movieControllers.getMovieById);

app.post("/api/movies", validateMovie, movieControllers.postMovie);

app.put("/api/movies/:id", validateMovie, movieControllers.updateMovie);

app.delete("/api/movies/:id", movieControllers.deleteMovie);

app.get("/api/users", userControllers.getUsers);
app.get("/api/users/:id", userControllers.getUsersById);

app.post("/api/users", hashPassword, validateUser, userControllers.postUser);

app.put("/api/users/:id", hashPassword, validateUser, userControllers.updateUser);

app.delete("/api/users/:id", userControllers.deleteUser);

module.exports = app;
