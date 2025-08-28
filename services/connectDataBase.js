const mongoose = require("mongoose");

let isConnected = false;

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
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error?.message || error);
    // Do not exit in serverless; allow non-DB routes to continue responding
  }
};

module.exports = connectDataBase;
