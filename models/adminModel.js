const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'collector'],
      default: 'admin',
    },
    // Admin permissions
    permissions: {
      manageSchedules: { type: Boolean, default: true },
      manageUsers: { type: Boolean, default: true },
      sendNotifications: { type: Boolean, default: true },
      viewReports: { type: Boolean, default: true },
      manageZones: { type: Boolean, default: true },
    },
    // Current location for live tracking
    currentLocation: {
      coordinates: {
        lat: Number,
        lng: Number,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
      isOnline: {
        type: Boolean,
        default: false,
      },
    },
    // Assigned zones for collection
    assignedZones: [{
      type: String,
      trim: true,
    }],
    // Collection vehicle info
    vehicleInfo: {
      vehicleNumber: String,
      vehicleType: String,
      capacity: Number, // in kg
    },
    // Push notification subscription for admin
    pushSubscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },
  },
  { timestamps: true }
);

// Index for better query performance
adminSchema.index({ role: 1, 'currentLocation.isOnline': 1 });
adminSchema.index({ assignedZones: 1 });

module.exports = mongoose.model("Admin", adminSchema);
