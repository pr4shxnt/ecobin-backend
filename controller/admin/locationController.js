const Admin = require('../../models/adminModel');
const WasteSchedule = require('../../models/wasteScheduleModel');

// Update admin location
const updateAdminLocation = async (req, res) => {
  try {
    const { lat, lng, isOnline = true } = req.body;
    const adminId = req.admin._id;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      {
        'currentLocation.coordinates': { lat, lng },
        'currentLocation.lastUpdated': new Date(),
        'currentLocation.isOnline': isOnline
      },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: {
        coordinates: admin.currentLocation.coordinates,
        lastUpdated: admin.currentLocation.lastUpdated,
        isOnline: admin.currentLocation.isOnline
      }
    });
  } catch (error) {
    console.error('Error updating admin location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get admin location
const getAdminLocation = async (req, res) => {
  try {
    const adminId = req.admin._id;

    const admin = await Admin.findById(adminId).select('currentLocation');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin.currentLocation
    });
  } catch (error) {
    console.error('Error fetching admin location:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all online admins
const getOnlineAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({
      'currentLocation.isOnline': true
    }).select('firstName lastName currentLocation assignedZones vehicleInfo');

    res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Error fetching online admins:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get route with stops for a specific zone
const getRouteWithStops = async (req, res) => {
  try {
    const { zone } = req.params;

    if (!zone) {
      return res.status(400).json({
        success: false,
        message: 'Zone is required'
      });
    }

    // Get schedule for the zone
    const schedule = await WasteSchedule.findOne({ zone, status: 'active' });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'No active schedule found for this zone'
      });
    }

    // Get online admins assigned to this zone
    const admins = await Admin.find({
      'currentLocation.isOnline': true,
      assignedZones: zone
    }).select('firstName lastName currentLocation vehicleInfo');

    // Create route data
    const routeData = {
      zone,
      schedule: {
        collectionDay: schedule.collectionDay,
        collectionTime: schedule.collectionTime,
        scheduleName: schedule.scheduleName
      },
      stops: schedule.targetAddresses.map((address, index) => ({
        id: index + 1,
        address: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`,
        coordinates: address.coordinates,
        status: 'pending'
      })),
      admins: admins.map(admin => ({
        id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        location: admin.currentLocation.coordinates,
        vehicle: admin.vehicleInfo
      }))
    };

    res.status(200).json({
      success: true,
      data: routeData
    });
  } catch (error) {
    console.error('Error fetching route with stops:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all routes for admin dashboard
const getAllRoutes = async (req, res) => {
  try {
    const schedules = await WasteSchedule.find({ status: 'active' })
      .populate('createdBy', 'firstName lastName');

    const routes = await Promise.all(
      schedules.map(async (schedule) => {
        const admins = await Admin.find({
          'currentLocation.isOnline': true,
          assignedZones: schedule.zone
        }).select('firstName lastName currentLocation');

        return {
          id: schedule._id,
          zone: schedule.zone,
          scheduleName: schedule.scheduleName,
          collectionDay: schedule.collectionDay,
          collectionTime: schedule.collectionTime,
          totalStops: schedule.targetAddresses.length,
          onlineAdmins: admins.length,
          admins: admins.map(admin => ({
            id: admin._id,
            name: `${admin.firstName} ${admin.lastName}`,
            location: admin.currentLocation.coordinates
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      data: routes
    });
  } catch (error) {
    console.error('Error fetching all routes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update collection status for a stop
const updateCollectionStatus = async (req, res) => {
  try {
    const { scheduleId, stopIndex, status, notes } = req.body;
    const adminId = req.admin._id;

    if (!scheduleId || stopIndex === undefined || !status) {
      return res.status(400).json({
        success: false,
        message: 'Schedule ID, stop index, and status are required'
      });
    }

    const schedule = await WasteSchedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Add collection history entry
    schedule.collectionHistory.push({
      date: new Date(),
      status,
      notes,
      completedBy: adminId
    });

    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Collection status updated successfully',
      data: {
        scheduleId,
        stopIndex,
        status,
        notes
      }
    });
  } catch (error) {
    console.error('Error updating collection status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Set admin offline
const setAdminOffline = async (req, res) => {
  try {
    const adminId = req.admin._id;

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      {
        'currentLocation.isOnline': false,
        'currentLocation.lastUpdated': new Date()
      },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin set to offline successfully'
    });
  } catch (error) {
    console.error('Error setting admin offline:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  updateAdminLocation,
  getAdminLocation,
  getOnlineAdmins,
  getRouteWithStops,
  getAllRoutes,
  updateCollectionStatus,
  setAdminOffline
};
