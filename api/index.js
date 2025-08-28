const serverless = require("serverless-http");
const createApp = require("../app/createApp");

const app = createApp();

module.exports = serverless(app);


