const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/adminModel");

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    if (!emailAddress || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({
      emailAddress: emailAddress.toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.emailAddress, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    // Update online status
    admin.currentLocation.isOnline = true;
    admin.currentLocation.lastUpdated = new Date();
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          emailAddress: admin.emailAddress,
          role: admin.role,
          permissions: admin.permissions,
          assignedZones: admin.assignedZones,
          vehicleInfo: admin.vehicleInfo,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin Registration (for super admin only)
const adminRegister = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      password,
      role = "admin",
      assignedZones = [],
      vehicleInfo = {},
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !emailAddress || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      emailAddress: emailAddress.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const admin = new Admin({
      firstName,
      lastName,
      emailAddress: emailAddress.toLowerCase(),
      phoneNumber,
      password: hashedPassword,
      role,
      assignedZones,
      vehicleInfo,
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        emailAddress: admin.emailAddress,
        role: admin.role,
        assignedZones: admin.assignedZones,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, assignedZones, vehicleInfo } =
      req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (assignedZones) updateData.assignedZones = assignedZones;
    if (vehicleInfo) updateData.vehicleInfo = vehicleInfo;

    const admin = await Admin.findByIdAndUpdate(req.admin._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Admin logout
const adminLogout = async (req, res) => {
  try {
    // Update admin status to offline
    await Admin.findByIdAndUpdate(req.admin._id, {
      "currentLocation.isOnline": false,
      "currentLocation.lastUpdated": new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  adminLogin,
  adminRegister,
  getAdminProfile,
  updateAdminProfile,
  adminLogout,
};
