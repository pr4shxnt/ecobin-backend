const mongoose = require("mongoose");

const connectDataBase = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/ecobin");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDataBase;
