# Training Progress Bridge System

## Overview
This system bridges the gap between your **training app/website** and your **LMS training assignment site**. It ensures that when users complete videos in your training app, the progress is automatically synced to your LMS system, showing the correct completion percentages instead of 0.00%.

## Problem Solved
- **Before**: Your LMS site shows 0.00% completion even when videos are completed
- **After**: Real-time progress sync between training app and LMS system
- **Result**: Accurate completion tracking and progress display

## How It Works

### 1. Training App Side
When a user watches a video in your training app:
- Video progress is tracked in real-time
- Completion events are sent to the bridge
- Progress data is stored locally and synced to LMS

### 2. Bridge System
The bridge acts as a middleware that:
- Receives progress updates from training app
- Updates local database
- Sends updates to your LMS system
- Handles errors and retries

### 3. LMS System Side
Your LMS system receives:
- Real-time progress updates
- Video completion notifications
- Module completion status
- Overall training progress

## Setup Instructions

### Step 1: Configure LMS Integration

1. Copy `backend/lms-config.example.js` to `backend/lms-config.js`
2. Update the configuration with your actual LMS system details:

```javascript
module.exports = {
  // Replace with your actual LMS system URL
  LMS_BASE_URL: 'https://your-lms-system.com',
  
  // Replace with your actual API token
  LMS_API_TOKEN: 'your-lms-api-token-here',
  
  // Update endpoints to match your LMS system
  UPDATE_PROGRESS_ENDPOINT: '/api/update-training-progress',
  GET_PROGRESS_ENDPOINT: '/api/get-training-progress'
};
```

### Step 2: Start the Backend

```bash
cd backend
npm install
npm run dev
```

The bridge will be available at:
- `POST /api/bridge/update-progress` - Update training progress
- `POST /api/bridge/video-completion` - Handle video completion
- `GET /api/bridge/progress/:userId/:trainingId` - Get progress
- `POST /api/bridge/sync-all-progress` - Sync all progress

### Step 3: Integrate with Your Training App

Import and use the bridge service in your training app:

```javascript
import { 
  trackVideoProgress, 
  completeVideo, 
  completeModule,
  completeTraining 
} from './services/trainingProgressBridge';

// Track video progress in real-time
await trackVideoProgress({
  userId: 'user123',
  trainingId: 'training456',
  moduleId: 'module789',
  videoId: 'video101',
  currentTime: 45, // seconds
  duration: 120,   // seconds
  action: 'video_progress'
});

// Record video completion
await completeVideo({
  userId: 'user123',
  trainingId: 'training456',
  moduleId: 'module789',
  videoId: 'video101',
  duration: 120
});

// Complete module
await completeModule({
  userId: 'user123',
  trainingId: 'training456',
  moduleId: 'module789',
  moduleName: 'Customer Education'
});

// Complete training
await completeTraining({
  userId: 'user123',
  trainingId: 'training456'
});
```

## API Endpoints

### Update Training Progress
```http
POST /api/bridge/update-progress
Content-Type: application/json

{
  "userId": "user123",
  "trainingId": "training456",
  "moduleId": "module789",
  "videoId": "video101",
  "progress": 75,
  "status": "in_progress",
  "action": "video_progress"
}
```

### Handle Video Completion
```http
POST /api/bridge/video-completion
Content-Type: application/json

{
  "userId": "user123",
  "trainingId": "training456",
  "moduleId": "module789",
  "videoId": "video101",
  "duration": 120,
  "watchTime": 120
}
```

### Get Training Progress
```http
GET /api/bridge/progress/user123/training456
```

### Sync All Progress
```http
POST /api/bridge/sync-all-progress
```

## Integration Examples

### 1. Video Player Integration

```javascript
// In your video player component
const handleVideoProgress = async (currentTime, duration) => {
  try {
    await trackVideoProgress({
      userId: currentUser.id,
      trainingId: currentTraining.id,
      moduleId: currentModule.id,
      videoId: currentVideo.id,
      currentTime,
      duration,
      action: 'video_progress'
    });
  } catch (error) {
    console.error('Failed to track video progress:', error);
  }
};

const handleVideoComplete = async () => {
  try {
    await completeVideo({
      userId: currentUser.id,
      trainingId: currentTraining.id,
      moduleId: currentModule.id,
      videoId: currentVideo.id,
      duration: currentVideo.duration
    });
  } catch (error) {
    console.error('Failed to complete video:', error);
  }
};
```

### 2. Progress Tracking Component

```javascript
// In your progress tracking component
const [completionStatus, setCompletionStatus] = useState(null);

useEffect(() => {
  const fetchProgress = async () => {
    try {
      const status = await getTrainingCompletionStatus(userId, trainingId);
      setCompletionStatus(status);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  fetchProgress();
  // Refresh every 30 seconds
  const interval = setInterval(fetchProgress, 30000);
  return () => clearInterval(interval);
}, [userId, trainingId]);
```

### 3. Training Completion Handler

```javascript
// When all modules are completed
const handleTrainingComplete = async () => {
  try {
    await completeTraining({
      userId: currentUser.id,
      trainingId: currentTraining.id
    });
    
    // Show completion message
    setShowCompletionMessage(true);
  } catch (error) {
    console.error('Failed to complete training:', error);
  }
};
```

## Configuration Options

### Progress Thresholds
```javascript
// In lms-config.js
VIDEO_COMPLETION_THRESHOLD: 90,    // 90% watched = completed
MODULE_COMPLETION_THRESHOLD: 100,  // 100% = completed
```

### Sync Settings
```javascript
// In lms-config.js
ENABLE_AUTO_SYNC: true,                    // Enable automatic syncing
SYNC_ON_VIDEO_COMPLETION: true,            // Sync when video completes
SYNC_ON_MODULE_COMPLETION: true,           // Sync when module completes
SYNC_ON_TRAINING_COMPLETION: true,         // Sync when training completes
BRIDGE_SYNC_INTERVAL: 300000,             // Auto-sync every 5 minutes
```

## Troubleshooting

### Common Issues

1. **LMS API Connection Failed**
   - Check your `LMS_BASE_URL` and `LMS_API_TOKEN`
   - Verify your LMS system is accessible
   - Check network connectivity

2. **Progress Not Updating**
   - Ensure the bridge service is running
   - Check browser console for errors
   - Verify user and training IDs match

3. **Sync Errors**
   - Check database connection
   - Verify Training model schema
   - Check for missing required fields

### Debug Mode

Enable debug logging in your frontend:

```javascript
// In your config.js
export const config = {
  ENABLE_DEBUG: true,
  LOG_API_CALLS: true
};
```

### Testing the Bridge

Test the bridge endpoints:

```bash
# Test progress update
curl -X POST http://localhost:5000/api/bridge/update-progress \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "trainingId": "test456",
    "progress": 50,
    "status": "in_progress"
  }'

# Test video completion
curl -X POST http://localhost:5000/api/bridge/video-completion \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "trainingId": "test456",
    "videoId": "test789",
    "duration": 120,
    "watchTime": 120
  }'
```

## Data Flow

```
Training App → Bridge → Local DB + LMS System
     ↓           ↓           ↓
Video Progress → Progress Update → Real-time Sync
     ↓           ↓           ↓
Completion → Status Update → LMS Display
```

## Benefits

1. **Real-time Progress**: Instant updates between systems
2. **Accurate Tracking**: No more 0.00% completion issues
3. **Reliable Sync**: Automatic retry and error handling
4. **Flexible Integration**: Works with any LMS system
5. **Comprehensive Tracking**: Video, module, and training level progress

## Next Steps

1. **Configure your LMS system details** in `lms-config.js`
2. **Test the bridge endpoints** with your actual data
3. **Integrate the bridge service** into your training app
4. **Monitor the sync process** and adjust as needed
5. **Customize progress thresholds** based on your requirements

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your LMS system configuration
3. Test the bridge endpoints individually
4. Check the backend logs for detailed error information

The bridge system will automatically handle most errors and retry failed operations, ensuring your training progress is always up-to-date.
