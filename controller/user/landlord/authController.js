const cloudinary = require("../../../services/cloudinary");
const Landlord = require("../../../models/users/landlord/landlordModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Update uploadToCloudinary to accept filename
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    let resourceType = "auto"; //resource type (auto so that cloudinary detects itself)
    const stream = cloudinary.uploader.upload_stream(
      // stream start

      {
        folder: "landlord", //folder for saving files
        resource_type: resourceType, // resource type parameter
        public_id: filename, // set custom filename
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result); // returning either result or error statement
      }
    );

    stream.end(buffer); //cloudinary stream end
  });
};

// Controller to create a new landlord
const createLandlord = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      password,
    } = req.body;

    // Handle proofOfAddress file (single)
    let proofOfAddress = "";
    if (req.files && req.files.proofOfAddress && req.files.proofOfAddress[0]) {
      const file = req.files.proofOfAddress[0];
      const customFilename = `houseowner_${firstName.toLowerCase()}_${lastName.toLowerCase()}_dob_proof_of_address`;
      const result = await uploadToCloudinary(file.buffer, customFilename);
      proofOfAddress = result.secure_url;
    }

    // Handle houseDocuments file (single)
    let houseDocuments = "";
    if (req.files && req.files.houseDocuments && req.files.houseDocuments[0]) {
      const file = req.files.houseDocuments[0];
      const customFilename = `houseowner_${firstName.toLowerCase()}_${lastName.toLowerCase()}_dob_housedocuments`;
      const result = await uploadToCloudinary(file.buffer, customFilename);
      houseDocuments = result.secure_url;
    }

    const landlord = new Landlord({
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      password,
      houseDocuments,
      proofOfAddress,
    });

    await landlord.save();
    res
      .status(201)
      .json({ message: "Landlord created successfully", landlord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLandlord,
};

// Controller to login landlord
const loginLandlord = async (req, res) => {
  try {
    const { emailAddress, password } = req.body;

    const landlord = await Landlord.findOne({ emailAddress });
    if (!landlord) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, landlord.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: landlord._id, emailAddress: landlord.emailAddress },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", landlord, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.loginLandlord = loginLandlord;
