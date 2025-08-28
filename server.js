require("dotenv").config();
const express = require("express");
const cors = require("cors");
const main = require("./app/main");
const routeEntries = require("./app/routeEntries");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

main(app);
routeEntries(app);

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
