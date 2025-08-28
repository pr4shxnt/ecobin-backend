const connectDataBase = require("../services/connectDataBase");
const axios = require("axios");

const main = (app) => {
  connectDataBase();
  // Set a conservative global timeout to avoid hanging serverless invocations
  if (axios && axios.defaults) {
    axios.defaults.timeout = Number(process.env.AXIOS_TIMEOUT_MS || 8000);
  }
};

module.exports = main;
