const mongoose = require("mongoose");

let isConnected = false;

// Avoid buffering model ops when DB is unavailable
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", true);

const connectDataBase = async () => {
	if (isConnected) {
		return;
	}

	const mongoUri = process.env.MONGO_URI;
	if (!mongoUri) {
		console.warn("MONGO_URI not set. Skipping database connection.");
		return;
	}

	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
			connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 5000),
			socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 10000),
			maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 5),
		});
		isConnected = true;
		console.log("MongoDB connected successfully");
	} catch (error) {
		console.error("MongoDB connection error:", error?.message || error);
		// Do not exit in serverless; allow non-DB routes to continue responding
	}
};

module.exports = connectDataBase;


