const Tenant = require("../../../models/users/tenant/tenantModel");
const cloudinary = require("../../../services/cloudinary");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// helper for cloudinary upload
const uploadToCloudinary = (buffer, folder = "tenants", fileName = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: "auto",
    };

    if (fileName) {
      options.public_id = fileName.replace(/\s+/g, "_"); // remove spaces
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

exports.registerTenant = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      occupation,
      employer,
      annualIncome,
      currentAddress,
      city,
      state,
      zipCode,
      password,
    } = req.body;

    console.log(req.files);

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // format DOB for file name
    const dobString = new Date(dateOfBirth).toISOString().split("T")[0];

    let rentalAgreement = {};
    let photoIdentityProof = {};

    // Upload rentalAgreement
    if (req.files?.rentalAgreement) {
      const buffer = req.files.rentalAgreement[0].buffer;
      const result = await uploadToCloudinary(
        buffer,
        "tenants/rentalAgreements",
        `${firstName}_${lastName}_${dobString}_rentalAgreement`
      );
      rentalAgreement = result.secure_url;
    }

    // Upload photoIdentityProof
    if (req.files?.photoIdentityProof) {
      const buffer = req.files.photoIdentityProof[0].buffer;
      const result = await uploadToCloudinary(
        buffer,
        "tenants/photoIDs",
        `${firstName}_${lastName}_${dobString}_photoID`
      );
      photoIdentityProof = result.secure_url;
    }

    // save tenant
    const tenant = new Tenant({
      firstName,
      lastName,
      emailAddress: email,
      phoneNumber: phone,
      dateOfBirth,
      occupation,
      employer,
      annualIncome,
      currentAddress,
      city,
      state,
      zipCode,
      password: hashedPassword,
      rentalAgreement,
      photoIdentityProof,
    });

    await tenant.save();

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: tenant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.loginTenant = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email || !password) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const tenant = await Tenant.findOne({ emailAddress: email });
    if (!tenant) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, tenant.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: tenant._id, email: tenant.emailAddress, role: "tenant" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: tenant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.verifyAuth = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      success: true,
      message: "Token is valid",
      data: decoded,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenant = await Tenant.findById(decoded.id).select("-password");
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }
    const tenantData = tenant.toObject();
    delete tenantData.password;
    res.status(200).json({
      success: true,
      data: tenantData,
      userId: decoded.id,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const tenant = await Tenant.findById(id).select("-password");
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }
    const tenantData = tenant.toObject();
    delete tenantData.password;
    res.status(200).json({
      success: true,
      data: tenantData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};
