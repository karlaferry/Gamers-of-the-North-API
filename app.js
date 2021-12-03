// REQUIRES
const express = require("express");
const apiRouter = require("./routers/api.router");
const {
  customErrorHandling,
  handle404,
  handle500,
} = require("./errors/errors");

// CREATE SERVER
const app = express();
app.use(express.json());

// ROUTER
app.get("/", (req, res, next) => {
  res.status(200).send({ msg: "Hello from CICD!🎉" });
});
app.use("/api", apiRouter);

// ERROR HANDLING
app.use(customErrorHandling);
app.use(handle500);
app.all("/*", handle404);

module.exports = app;
