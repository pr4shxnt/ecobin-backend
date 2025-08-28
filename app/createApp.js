require("dotenv").config();
const express = require("express");
const cors = require("cors");
const main = require("./main");
const routeEntries = require("./routeEntries");

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  main(app);
  routeEntries(app);

  return app;
};

module.exports = createApp;
