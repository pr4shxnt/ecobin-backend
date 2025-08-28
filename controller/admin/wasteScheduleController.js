const WasteSchedule = require('../../models/wasteScheduleModel');
const PushNotification = require('../../models/pushNotificationModel');
const PushNotificationService = require('../../services/pushNotificationService');

// Create a new waste schedule
const createWasteSchedule = async (req, res) => {
  try {
    const {
      scheduleName,
      collectionDay,
      collectionTime,
      zone,
      targetAddresses,
      reminderFrequency = 2,
      pushNotificationEnabled = true
    } = req.body;

    // Validate required fields
    if (!scheduleName || !collectionDay || !collectionTime || !zone || !targetAddresses) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Calculate next notification date
    const nextNotificationDate = new Date();
    nextNotificationDate.setDate(nextNotificationDate.getDate() + reminderFrequency);

    const schedule = new WasteSchedule({
      scheduleName,
      collectionDay,
      collectionTime,
      zone,
      targetAddresses,
      reminderFrequency,
      pushNotificationEnabled,
      nextNotificationDate,
      createdBy: req.admin._id
    });

    await schedule.save();

    res.status(201).json({
      success: true,
      message: 'Waste schedule created successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error creating waste schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all waste schedules
const getAllWasteSchedules = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, zone } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (zone) filter.zone = zone;

    const schedules = await WasteSchedule.find(filter)
      .populate('createdBy', 'firstName lastName emailAddress')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WasteSchedule.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: schedules,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching waste schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single waste schedule
const getWasteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await WasteSchedule.findById(id)
      .populate('createdBy', 'firstName lastName emailAddress');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Waste schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error fetching waste schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update waste schedule
const updateWasteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const schedule = await WasteSchedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName emailAddress');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Waste schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Waste schedule updated successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Error updating waste schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete waste schedule
const deleteWasteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await WasteSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Waste schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Waste schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting waste schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send manual notification
const sendManualNotification = async (req, res) => {
  try {
    const { addresses, title, body, data = {} } = req.body;

    if (!addresses || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: addresses, title, body'
      });
    }

    const results = await PushNotificationService.sendManualNotification(
      addresses,
      title,
      body,
      data,
      req.admin._id
    );

    res.status(200).json({
      success: true,
      message: 'Notifications sent successfully',
      data: results
    });
  } catch (error) {
    console.error('Error sending manual notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send waste reminders manually
const sendWasteReminders = async (req, res) => {
  try {
    const results = await PushNotificationService.sendWasteReminders();

    res.status(200).json({
      success: true,
      message: 'Waste reminders sent successfully',
      data: results
    });
  } catch (error) {
    console.error('Error sending waste reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get notification history
const getNotificationHistory = async (req, res) => {
  try {
    const { address, limit = 50 } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const notifications = await PushNotificationService.getNotificationHistory(
      JSON.parse(address),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const stats = await PushNotificationService.getNotificationStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createWasteSchedule,
  getAllWasteSchedules,
  getWasteSchedule,
  updateWasteSchedule,
  deleteWasteSchedule,
  sendManualNotification,
  sendWasteReminders,
  getNotificationHistory,
  getNotificationStats
};
