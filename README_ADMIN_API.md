# Ecobin Admin API Documentation

## Overview
This API provides endpoints for managing waste collection schedules, sending push notifications, and tracking admin locations for the Ecobin waste management system.

## Base URL
```
http://localhost:5000/admin
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Admin Login
```
POST /admin/auth/login
```
**Body:**
```json
{
  "emailAddress": "admin@example.com",
  "password": "password123"
}
```

#### Admin Registration
```
POST /admin/auth/register
```
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emailAddress": "admin@example.com",
  "phoneNumber": "+1234567890",
  "password": "password123",
  "role": "admin",
  "assignedZones": ["Zone A", "Zone B"],
  "vehicleInfo": {
    "vehicleNumber": "ABC123",
    "vehicleType": "Truck",
    "capacity": 1000
  }
}
```

#### Get Admin Profile
```
GET /admin/auth/profile
```

#### Update Admin Profile
```
PUT /admin/auth/profile
```

#### Admin Logout
```
POST /admin/auth/logout
```

### Waste Schedules

#### Create Waste Schedule
```
POST /admin/schedules
```
**Body:**
```json
{
  "scheduleName": "Weekly Collection - Zone A",
  "collectionDay": "monday",
  "collectionTime": "09:00",
  "zone": "Zone A",
  "targetAddresses": [
    {
      "street": "123 Main St",
      "city": "Kathmandu",
      "state": "Bagmati",
      "zipCode": "44600",
      "coordinates": {
        "lat": 27.7172,
        "lng": 85.3240
      }
    }
  ],
  "reminderFrequency": 2,
  "pushNotificationEnabled": true
}
```

#### Get All Schedules
```
GET /admin/schedules?page=1&limit=10&status=active&zone=Zone A
```

#### Get Single Schedule
```
GET /admin/schedules/:id
```

#### Update Schedule
```
PUT /admin/schedules/:id
```

#### Delete Schedule
```
DELETE /admin/schedules/:id
```

### Notifications

#### Send Manual Notification
```
POST /admin/notifications/send
```
**Body:**
```json
{
  "addresses": [
    {
      "street": "123 Main St",
      "city": "Kathmandu",
      "state": "Bagmati",
      "zipCode": "44600"
    }
  ],
  "title": "Important Notice",
  "body": "Waste collection will be delayed today",
  "data": {
    "type": "emergency"
  }
}
```

#### Send Waste Reminders
```
POST /admin/notifications/reminders
```

#### Get Notification History
```
GET /admin/notifications/history?address={"street":"123 Main St","city":"Kathmandu","state":"Bagmati","zipCode":"44600"}&limit=50
```

#### Get Notification Statistics
```
GET /admin/notifications/stats
```

### Location & Routes

#### Update Admin Location
```
POST /admin/location/update
```
**Body:**
```json
{
  "lat": 27.7172,
  "lng": 85.3240,
  "isOnline": true
}
```

#### Get Admin Location
```
GET /admin/location
```

#### Get Online Admins
```
GET /admin/location/online-admins
```

#### Get All Routes
```
GET /admin/routes
```

#### Get Route with Stops
```
GET /admin/routes/:zone
```

#### Update Collection Status
```
POST /admin/routes/collection-status
```
**Body:**
```json
{
  "scheduleId": "schedule_id_here",
  "stopIndex": 0,
  "status": "completed",
  "notes": "Collection completed successfully"
}
```

#### Set Admin Offline
```
POST /admin/location/offline
```

## Models

### Waste Schedule
```javascript
{
  scheduleName: String,
  collectionDay: String, // monday, tuesday, etc.
  collectionTime: String, // HH:MM format
  zone: String,
  targetAddresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  status: String, // active, inactive, suspended
  pushNotificationEnabled: Boolean,
  reminderFrequency: Number, // days between reminders
  collectionHistory: [{
    date: Date,
    status: String, // scheduled, in-progress, completed, missed, cancelled
    notes: String,
    completedBy: ObjectId
  }]
}
```

### Admin
```javascript
{
  firstName: String,
  lastName: String,
  emailAddress: String,
  phoneNumber: String,
  password: String,
  role: String, // super_admin, admin, collector
  permissions: {
    manageSchedules: Boolean,
    manageUsers: Boolean,
    sendNotifications: Boolean,
    viewReports: Boolean,
    manageZones: Boolean
  },
  currentLocation: {
    coordinates: {
      lat: Number,
      lng: Number
    },
    lastUpdated: Date,
    isOnline: Boolean
  },
  assignedZones: [String],
  vehicleInfo: {
    vehicleNumber: String,
    vehicleType: String,
    capacity: Number
  }
}
```

## Push Notifications

The system automatically sends push notifications every 2 days to remind users about waste collection. Notifications are sent based on the addresses configured in each schedule.

### Notification Types
- `waste_reminder`: Automatic reminders about waste collection
- `schedule_update`: Updates about schedule changes
- `collection_status`: Status updates about collection progress
- `system`: System notifications
- `emergency`: Emergency notifications

## Cron Jobs

The system includes automated cron jobs:
- **Daily at 8:00 AM**: Send waste reminder notifications
- **Every 5 minutes**: Check admin online status

## Environment Variables

Add these to your `.env` file:
```
JWT_SECRET=your_jwt_secret_here
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## Usage Examples

### Creating a Schedule
1. Login as admin
2. Create a waste schedule with target addresses
3. The system will automatically send notifications every 2 days

### Live Tracking
1. Admin updates their location via mobile app
2. Location is stored in database
3. Frontend can fetch live locations and display on map

### Route Management
1. Get all routes for dashboard
2. Get specific route with stops for a zone
3. Update collection status as admin progresses through stops
