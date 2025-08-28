const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Landlord = require("./models/users/landlord/landlordModel");
const connectDB = require("./services/connectDataBase");

async function createLandlord() {
  try {
    // Connect to database
    await connectDB();

    // Check if landlord already exists
    const existingLandlord = await Landlord.findOne({ emailAddress: "landlord@ecobin.com" });
    if (existingLandlord) {
      console.log("Landlord user already exists!");
      console.log("Email: landlord@ecobin.com");
      console.log("Password: landlord123");
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("landlord123", salt);

    // Create landlord user
    const landlord = new Landlord({
      firstName: "John",
      lastName: "Doe",
      emailAddress: "landlord@ecobin.com",
      password: hashedPassword,
      phoneNumber: "1234567890",
      address: {
        street: "123 Main St",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        coordinates: {
          lat: 27.7172,
          lng: 85.3240,
        },
      },
      properties: [],
      isVerified: true,
      isActive: true,
    });

    await landlord.save();

    console.log("✅ Landlord user created successfully!");
    console.log("📋 Login Credentials:");
    console.log("   Email: landlord@ecobin.com");
    console.log("   Password: landlord123");
    console.log("\n🔗 Access the landlord dashboard at: http://localhost:5173/landlord/login");

  } catch (error) {
    console.error("❌ Error creating landlord:", error.message);
  } finally {
    process.exit(0);
  }
}

createLandlord();
