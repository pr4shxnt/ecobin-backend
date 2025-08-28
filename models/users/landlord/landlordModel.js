const mongoose = require("mongoose");

const landlordSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    houseDocuments: {
      type: String,
      required: true,
    },
    proofOfAddress: {
      filename: String,
      url: String,
      mimetype: String,
      size: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Landlord", landlordSchema);
