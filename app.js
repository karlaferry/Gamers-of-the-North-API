// REQUIRES
const express = require("express");
const apiRouter = require("./routers/api.router");
const { customErrorHandling, handle404 } = require("./errors/errors");

// CREATE SERVER
const app = express();
app.use(express.json());

// ROUTER
app.use("/api", apiRouter);

// ERROR HANDLING
app.use(customErrorHandling);
app.all("/*", handle404);

module.exports = app;
