require("dotenv").config();
const express = require("express");
const cors = require("cors");
const main = require("./main");
const routeEntries = require("./routeEntries");

// Factory to create an Express app without starting a server
const createApp = () => {
	const app = express();

	// Middleware
	app.use(cors());
	app.use(express.json());

	// Initialize services (e.g., DB) and routes
	main(app);
	routeEntries(app);

	return app;
};

module.exports = createApp;


