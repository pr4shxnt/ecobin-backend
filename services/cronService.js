const cron = require('node-cron');
const PushNotificationService = require('./pushNotificationService');

class CronService {
  static init() {
    // Send waste reminders every day at 8:00 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('Running scheduled waste reminder notifications...');
      try {
        const results = await PushNotificationService.sendWasteReminders();
        console.log(`Sent ${results.length} waste reminder notifications`);
      } catch (error) {
        console.error('Error in scheduled waste reminders:', error);
      }
    });

    // Update admin online status every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      console.log('Checking admin online status...');
      try {
        // You can add logic here to mark admins as offline if they haven't updated their location recently
        // For example, mark as offline if last update was more than 10 minutes ago
      } catch (error) {
        console.error('Error checking admin online status:', error);
      }
    });

    console.log('Cron jobs initialized');
  }

  static stop() {
    // Stop all cron jobs
    cron.getTasks().forEach(task => task.stop());
    console.log('All cron jobs stopped');
  }
}

module.exports = CronService;
