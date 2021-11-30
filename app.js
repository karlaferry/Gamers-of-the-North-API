const express = require("express");
const apiRouter = require("./routers/api.router");
const { handle404 } = require("./errors/errors");
const app = express();
app.use(express.json());
app.use("/api", apiRouter);

app.all("/*", handle404);
module.exports = app;
