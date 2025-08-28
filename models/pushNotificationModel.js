const mongoose = require("mongoose");

const pushNotificationSchema = new mongoose.Schema(
  {
    // Address-based notification
    targetAddress: {
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
        lat: Number,
        lng: Number,
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['waste_reminder', 'schedule_update', 'collection_status', 'system', 'emergency'],
      default: 'waste_reminder',
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    clicked: {
      type: Boolean,
      default: false,
    },
    clickedAt: {
      type: Date,
    },
    // Related waste schedule
    wasteScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WasteSchedule',
    },
    // Admin who sent the notification
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

// Index for better query performance
pushNotificationSchema.index({ 'targetAddress.zipCode': 1, sent: 1, createdAt: -1 });
pushNotificationSchema.index({ type: 1, sent: 1 });
pushNotificationSchema.index({ wasteScheduleId: 1 });

module.exports = mongoose.model("PushNotification", pushNotificationSchema);
