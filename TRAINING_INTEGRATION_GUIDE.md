# Training Progress Integration Guide

This guide explains how to connect your LMS admin site with a training consumption site to track video progress in real-time.

## Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   LMS Admin Site    │    │   Backend API       │    │ Consumption Site    │
│   (Assigns Training)│◄──►│   (Progress Tracking)│◄──►│  (Watch Videos)     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## Backend Enhancements

### 1. Enhanced Training Model
The Training model now supports:
- **Video-level tracking**: Individual video progress within modules
- **Module-level progress**: Completion percentage per module
- **Watch time tracking**: Seconds watched per video
- **Completion status**: Automatic completion detection (90% threshold)

### 2. New API Endpoints

#### Update Video Progress
```http
PUT /api/trainings/user/:userId/training/:trainingId/module/:moduleId/video/:videoId/progress
Content-Type: application/json

{
  "watchTime": 450,      // seconds watched
  "totalDuration": 600,  // total video duration
  "completed": false     // optional, auto-detected if > 90%
}
```

#### Get Training Details with Progress
```http
GET /api/trainings/user/:userId/training/:trainingId/details
```

Response includes:
- Training information
- Module progress
- Video-level progress
- Watch times and completion status

## Frontend Components

### 1. VideoPlayer Component
- **Real-time progress tracking**: Updates server every 10 seconds
- **Resume functionality**: Continues from last watched position
- **Auto-completion**: Marks video complete at 90% watch time
- **Custom controls**: Play/pause, progress bar, time display

### 2. ModuleView Component
- **Video playlist**: Shows all videos in module
- **Progress visualization**: Individual and module progress
- **Navigation controls**: Previous/next video buttons
- **Completion tracking**: Visual indicators for completed videos

### 3. TrainingDashboard Component
- **Module navigation**: Sidebar with module progress
- **Overall progress**: Training completion percentage
- **Training information**: Deadlines, status, metadata

## Integration Steps

### Step 1: Backend Setup
1. Update your Training model with the enhanced schema
2. Add the new controller methods for video progress tracking
3. Update routes to include new endpoints
4. Test endpoints with sample data

### Step 2: Frontend Implementation
1. Create the consumption site components
2. Implement the training API functions
3. Add routing for the consumption site
4. Test video progress tracking

### Step 3: Connect Sites
1. Configure CORS to allow consumption site domain
2. Update API base URL in consumption site
3. Implement employee authentication
4. Test cross-site communication

## Usage Example

### For Training Consumption Site

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrainingConsumption from './pages/TrainingConsumption';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/training-consumption" element={<TrainingConsumption />} />
        <Route path="/training-consumption/:trainingId" element={<TrainingConsumption />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### Tracking Video Progress

```jsx
import { updateVideoProgress } from './api/trainingApi';

// In your video component
const handleTimeUpdate = async () => {
  const currentTime = videoRef.current.currentTime;
  const duration = videoRef.current.duration;
  
  // Update progress every 10 seconds
  if (currentTime - lastUpdate >= 10) {
    await updateVideoProgress(userId, trainingId, moduleId, videoId, {
      watchTime: currentTime,
      totalDuration: duration
    });
    lastUpdate = currentTime;
  }
};
```

## Progress Tracking Features

### Automatic Progress Calculation
- **Video Progress**: Based on watch time vs total duration
- **Module Progress**: Percentage of completed videos in module
- **Training Progress**: Percentage of completed modules

### Progress Persistence
- All progress is saved to MongoDB
- Users can resume from where they left off
- Progress is synchronized across devices

### Real-time Updates
- Progress updates every 10 seconds during video playback
- Immediate update when video reaches 90% completion
- Module and training status updated automatically

## LMS Admin Dashboard Integration

The progress tracked in the consumption site automatically appears in your LMS admin dashboard:

1. **Training Progress Overview**: See overall completion rates
2. **Detailed Progress Reports**: Module and video-level completion
3. **User Analytics**: Individual user progress tracking
4. **Deadline Monitoring**: Track users approaching deadlines

## Security Considerations

1. **Employee Authentication**: Users must verify with employee ID/password
2. **API Security**: All endpoints validate user assignment to trainings
3. **Data Validation**: Progress data is validated before saving
4. **CORS Configuration**: Restrict to authorized domains

## Testing the Integration

### 1. Test Video Progress Tracking
```bash
# Start a video, let it play for 30 seconds, check database
# Progress should be saved with 30 seconds watch time
```

### 2. Test Module Completion
```bash
# Complete all videos in a module
# Module status should change to 'completed'
# Training progress should update accordingly
```

### 3. Test Cross-Site Synchronization
```bash
# Update progress in consumption site
# Check that progress appears in LMS admin dashboard
```

## Deployment Notes

### Environment Variables
```env
# Backend
MONGODB_URI=your_mongodb_connection_string
PORT=5000
CORS_ORIGINS=https://your-consumption-site.com,https://your-lms-admin.com

# Frontend (Consumption Site)
REACT_APP_API_URL=https://your-backend-api.com
```

### CORS Configuration
Update your backend to allow consumption site domain:
```javascript
const corsOptions = {
  origin: [
    'https://your-lms-admin.com',
    'https://your-consumption-site.com',
    'http://localhost:3000' // for development
  ],
  credentials: true
};
```

## Monitoring and Analytics

The system provides comprehensive tracking:
- **Watch Time Analytics**: Time spent on each video
- **Completion Rates**: Module and training completion statistics
- **User Engagement**: Last watched dates and session duration
- **Progress Reports**: Detailed progress for administrators

This integration allows you to have a seamless training experience where employees can watch training content on a dedicated consumption site while their progress is automatically tracked and visible in the LMS admin dashboard.

