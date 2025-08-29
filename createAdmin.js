const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/adminModel");
const connectDB = require("./services/connectDataBase");

exports.createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Username: admin");
      console.log("Password: admin123");
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin user
    const admin = new Admin({
      username: "admin",
      emailAddress: "admin@ecobin.com",
      password: hashedPassword,
      firstName: "System ",
      lastName: "Administrator",
      role: "super_admin",
      phoneNumber: "1234567890",
      permissions: ["all"],
      assignedZones: ["Zone A", "Zone B"],
      vehicleInfo: {
        vehicleNumber: "ADMIN-001",
        vehicleType: "Truck",
        capacity: "2",
      },
    });

    await admin.save();

    console.log("✅ Admin user created successfully!");
    console.log("📋 Login Credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   Email: admin@ecobin.com");
    console.log(
      "\n🔗 Access the admin dashboard at: http://localhost:5173/admin/login"
    );
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};
