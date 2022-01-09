const usersRouter = require("express").Router();
const {
  getUsers,
  getUserByUsername,
  addUser,
} = require("../controllers/games.controllers");

usersRouter.route("/").get(getUsers).post(addUser);
usersRouter.route("/:username").get(getUserByUsername);

module.exports = usersRouter;
