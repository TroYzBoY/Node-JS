const express = require("express");
const app = express();

const logger = require("./middleware/logger");
const rateLimit = require("./middleware/rateLimit");

app.use(express.json());
app.use(logger);
app.use(rateLimit);

module.exports = app;