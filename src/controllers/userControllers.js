const database = require("../../database");

const getUsers = (req, res) => {
    const initialSql = "select * from users";
    const where = [];

    if (req.query.language != null) {
        where.push({
            column: "language",
            value: req.query.language,
            operator: "=",
        });
    }
    if (req.query.city != null) {
        where.push({
            column: "city",
            value: req.query.city,
            operator: "=",
        });
    }

  database
  .query(
    where.reduce(
        (sql, { column, operator }, index) =>
            `${sql} ${index === 0 ? "where" : "and"} ${column} ${operator} ?`,
        initialSql
    ),
    where.map(({ value }) => value)
  )
  .then(([users]) => {
    res.json(users);
  })
  .catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
};

const getUsersById = (req, res) => {
    const id = parseInt(req.params.id);
  
    database
      .query("select * from users where id = ?", [id])
      .then(([users]) => {
        if (users[0] != null) {
          res.json(users[0]);
        } else {
          res.sendStatus(404);
        }
      })
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  };

  const postUser = (req, res) => {
    const { firstname, lastname, email, city, language } = req.body;

    database
    .query(
        "INSERT INTO users(firstname, lastname, email, city, language) VALUE (?, ?, ?, ?, ?)",
        [firstname, lastname, email, city, language]
    )
    .then(([result]) => {
        res.status(201).send({ id: result.insertId });
    })
    .catch((err) => {
        console.error(err);
        res.sendStatus(500);
    });
  };


  const updateUser = (req, res) => {
    const id = parseInt(req.params.id);
    const { firstname, lastname, email, city, language } = req.body;

    database
    .query(
        "UPDATE users set firstname=?, lastname=?, email=?, city=?, language=? WHERE id=?",
        [firstname, lastname, email, city, language, id]
    )
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  };
  
  module.exports = {
    getUsers,
    getUsersById,
    postUser,
    updateUser,
  };