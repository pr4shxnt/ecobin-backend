const express = require('express');
const router = express.Router();

// Import controllers
const wasteScheduleController = require('../controller/admin/wasteScheduleController');
const locationController = require('../controller/admin/locationController');
const authController = require('../controller/admin/authController');

// Import middleware
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Public routes (no authentication required)
router.post('/auth/login', authController.adminLogin);
router.post('/auth/register', authController.adminRegister);

// Protected routes (authentication required)
router.use(adminAuthMiddleware);

// Auth routes (protected)
router.get('/auth/profile', authController.getAdminProfile);
router.put('/auth/profile', authController.updateAdminProfile);
router.post('/auth/logout', authController.adminLogout);

// Waste Schedule Routes
router.post('/schedules', wasteScheduleController.createWasteSchedule);
router.get('/schedules', wasteScheduleController.getAllWasteSchedules);
router.get('/schedules/:id', wasteScheduleController.getWasteSchedule);
router.put('/schedules/:id', wasteScheduleController.updateWasteSchedule);
router.delete('/schedules/:id', wasteScheduleController.deleteWasteSchedule);

// Notification Routes
router.post('/notifications/send', wasteScheduleController.sendManualNotification);
router.post('/notifications/reminders', wasteScheduleController.sendWasteReminders);
router.get('/notifications/history', wasteScheduleController.getNotificationHistory);
router.get('/notifications/stats', wasteScheduleController.getNotificationStats);

// Location and Route Routes
router.post('/location/update', locationController.updateAdminLocation);
router.get('/location', locationController.getAdminLocation);
router.get('/location/online-admins', locationController.getOnlineAdmins);
router.get('/routes', locationController.getAllRoutes);
router.get('/routes/:zone', locationController.getRouteWithStops);
router.post('/routes/collection-status', locationController.updateCollectionStatus);
router.post('/location/offline', locationController.setAdminOffline);

module.exports = router;
