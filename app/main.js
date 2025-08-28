const connectDataBase = require("../services/connectDataBase");

const main = (app) => {
  connectDataBase();
};

module.exports = main;
