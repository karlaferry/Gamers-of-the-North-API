// REQUIRES
const express = require("express");
const apiRouter = require("./routers/api.router");
const cors = require("cors");
const {
  customErrorHandling,
  handle404,
  handle500,
  handlePSQLError,
} = require("./errors/errors");

// CREATE SERVER
const app = express();
app.use(cors());
app.use(express.json());

// ROUTER
app.get("/", (req, res, next) => {
  res.status(200).send({ msg: "Hello from CICD!🎉" });
});
app.use("/api", apiRouter);

// ERROR HANDLING
app.use(customErrorHandling);
// app.use(handlePSQLError);
app.use(handle500);
app.all("/*", handle404);

module.exports = app;
