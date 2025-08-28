const mongoose = require("mongoose");

const wasteScheduleSchema = new mongoose.Schema(
  {
    // Common schedule for all
    scheduleName: {
      type: String,
      required: true,
      trim: true,
    },
    // Fixed schedule by admin
    collectionDay: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    collectionTime: {
      type: String,
      required: true,
      default: '09:00',
    },
    // Area/Zone for this schedule
    zone: {
      type: String,
      required: true,
      trim: true,
    },
    // Addresses that will receive notifications for this schedule
    targetAddresses: [{
      street: {
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
      coordinates: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    }],
    // Schedule status
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    // Push notification settings
    pushNotificationEnabled: {
      type: Boolean,
      default: true,
    },
    reminderFrequency: {
      type: Number,
      default: 2, // Every 2 days
      min: 1,
      max: 7,
    },
    lastNotificationSent: {
      type: Date,
    },
    nextNotificationDate: {
      type: Date,
    },
    // Collection history
    collectionHistory: [{
      date: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'missed', 'cancelled'],
        default: 'scheduled',
      },
      notes: String,
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
      },
    }],
    // Admin who created this schedule
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for better query performance
wasteScheduleSchema.index({ collectionDay: 1, status: 1 });
wasteScheduleSchema.index({ zone: 1, status: 1 });
wasteScheduleSchema.index({ nextNotificationDate: 1 });

module.exports = mongoose.model("WasteSchedule", wasteScheduleSchema);
