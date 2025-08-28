const webpush = require('web-push');
const PushNotification = require('../models/pushNotificationModel');
const WasteSchedule = require('../models/wasteScheduleModel');

// Configure web-push with your VAPID keys
// You'll need to generate these keys and add them to your .env file
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

class PushNotificationService {
  // Send notification to a specific address
  static async sendNotificationToAddress(address, title, body, data = {}, scheduleId = null, adminId = null) {
    try {
      // Create notification record
      const notification = new PushNotification({
        targetAddress: address,
        title,
        body,
        data,
        wasteScheduleId: scheduleId,
        sentBy: adminId,
      });

      // For now, we'll simulate sending to all devices in that area
      // In a real implementation, you'd have a subscription database
      const success = await this.broadcastToArea(address, title, body, data);
      
      if (success) {
        notification.sent = true;
        notification.sentAt = new Date();
        notification.delivered = true;
        notification.deliveredAt = new Date();
      }

      await notification.save();
      return { success: true, notification };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send waste reminder notifications based on schedule
  static async sendWasteReminders() {
    try {
      const today = new Date();
      const activeSchedules = await WasteSchedule.find({ 
        status: 'active',
        pushNotificationEnabled: true,
        nextNotificationDate: { $lte: today }
      });

      const results = [];

      for (const schedule of activeSchedules) {
        // Send notifications to all target addresses
        for (const address of schedule.targetAddresses) {
          const title = `Waste Collection Reminder - ${schedule.scheduleName}`;
          const body = `Your waste collection is scheduled for ${schedule.collectionDay} at ${schedule.collectionTime}. Please keep your waste ready.`;
          
          const result = await this.sendNotificationToAddress(
            address,
            title,
            body,
            { scheduleId: schedule._id, collectionDay: schedule.collectionDay, collectionTime: schedule.collectionTime },
            schedule._id,
            schedule.createdBy
          );
          
          results.push(result);
        }

        // Update next notification date
        const nextDate = new Date(today);
        nextDate.setDate(nextDate.getDate() + schedule.reminderFrequency);
        
        schedule.lastNotificationSent = today;
        schedule.nextNotificationDate = nextDate;
        await schedule.save();
      }

      return results;
    } catch (error) {
      console.error('Error sending waste reminders:', error);
      throw error;
    }
  }

  // Send manual notification to specific addresses
  static async sendManualNotification(addresses, title, body, data = {}, adminId) {
    try {
      const results = [];

      for (const address of addresses) {
        const result = await this.sendNotificationToAddress(
          address,
          title,
          body,
          data,
          null,
          adminId
        );
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('Error sending manual notification:', error);
      throw error;
    }
  }

  // Broadcast to all devices in a specific area
  static async broadcastToArea(address, title, body, data) {
    try {
      // This is a placeholder implementation
      // In a real app, you would:
      // 1. Query your subscription database for devices in that area
      // 2. Send push notifications to each subscription
      
      console.log(`Broadcasting to area: ${address.city}, ${address.state}`);
      console.log(`Title: ${title}`);
      console.log(`Body: ${body}`);
      console.log(`Data:`, data);

      // Simulate successful broadcast
      return true;
    } catch (error) {
      console.error('Error broadcasting to area:', error);
      return false;
    }
  }

  // Get notification history for an address
  static async getNotificationHistory(address, limit = 50) {
    try {
      const notifications = await PushNotification.find({
        'targetAddress.zipCode': address.zipCode,
        'targetAddress.city': address.city
      })
      .sort({ createdAt: -1 })
      .limit(limit);

      return notifications;
    } catch (error) {
      console.error('Error getting notification history:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getNotificationStats() {
    try {
      const stats = await PushNotification.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            sent: { $sum: { $cond: ['$sent', 1, 0] } },
            delivered: { $sum: { $cond: ['$delivered', 1, 0] } },
            clicked: { $sum: { $cond: ['$clicked', 1, 0] } }
          }
        }
      ]);

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}

module.exports = PushNotificationService;
