# 🎯 LMS Video Progress Integration System

This comprehensive system allows external websites to track video watching progress and sync it with your main LMS platform in real-time.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Frontend Integration](#frontend-integration)
6. [External Website Integration](#external-website-integration)
7. [Installation & Setup](#installation--setup)
8. [Usage Examples](#usage-examples)
9. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This integration system provides:

- **Real-time video progress tracking** from external websites
- **Automatic progress synchronization** with your LMS
- **Detailed progress analytics** and reporting
- **User activity logging** for compliance tracking
- **Seamless integration** with existing LMS workflows

### Key Features

✅ **Automatic Progress Tracking** - Videos are automatically tracked when played
✅ **Real-time Sync** - Progress updates sync immediately with your LMS
✅ **Progress Persistence** - Progress is saved even if users switch devices
✅ **Detailed Analytics** - Track watch time, completion rates, and engagement
✅ **Easy Integration** - Simple JavaScript API for external websites
✅ **Flexible Configuration** - Customizable tracking intervals and thresholds

## 🏗️ Architecture

```
External Website (Video Player)
    ↓ (JavaScript API)
LMS Progress Integration API
    ↓ (Database Updates)
MongoDB Collections:
├── trainingprogresses (Progress data)
├── useractivitylogs (Activity tracking)
└── trainings & modules (Reference data)
    ↓ (Real-time Updates)
LMS Dashboard (React Components)
```

## 🚀 API Endpoints

### 1. Update Video Progress

**Endpoint:** `POST /api/training/update-video-progress`

**Purpose:** Update video watching progress from external websites

**Request Body:**
```json
{
  "userId": "68aab7310e17c845daa50352",
  "trainingId": "68ab07279782e8652d5b0e1c",
  "moduleId": "68173662b95f4caae809067e",
  "videoId": "video_001",
  "action": "started" | "completed" | "paused",
  "timestamp": "2025-01-20T10:30:00Z",
  "progress": 75,
  "duration": 300,
  "currentTime": 225
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video progress updated",
  "data": {
    "videoProgress": {
      "pass": true,
      "completedAt": "2025-01-20T10:35:00Z",
      "progress": 100
    },
    "moduleProgress": {
      "pass": true,
      "completionPercentage": "100.00"
    },
    "trainingProgress": {
      "overallCompletion": "75.00",
      "status": "In Progress"
    }
  }
}
```

### 2. Get User Progress

**Endpoint:** `GET /api/training/user-progress/{userId}`

**Purpose:** Get current training progress for a user

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "68aab7310e17c845daa50352",
    "activeTrainings": [
      {
        "trainingId": "68ab07279782e8652d5b0e1c",
        "trainingName": "Safety Training",
        "deadline": "2025-08-25T12:35:51.965Z",
        "overallProgress": 75,
        "status": "In Progress",
        "modules": [
          {
            "moduleId": "68173662b95f4caae809067e",
            "moduleName": "Module 1",
            "progress": 100,
            "pass": true,
            "videos": [
              {
                "videoId": "video_001",
                "videoName": "Introduction Video",
                "progress": 100,
                "pass": true,
                "lastWatched": "2025-01-20T10:35:00Z"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 3. Sync External Progress

**Endpoint:** `POST /api/training/sync-external-progress`

**Purpose:** Sync progress data from external systems

**Request Body:**
```json
{
  "userId": "68aab7310e17c845daa50352",
  "externalWebsiteData": {
    "videoId": "video_001",
    "watchTime": 225,
    "totalTime": 300,
    "completed": true,
    "lastActivity": "2025-01-20T10:35:00Z"
  }
}
```

## 💾 Database Schema

### Training Progress Collection

```javascript
{
  userId: String,           // User identifier
  trainingName: String,     // Training name
  trainingId: ObjectId,     // Reference to training
  pass: Boolean,           // Overall pass status
  status: String,          // Current status
  deadline: Date,          // Training deadline
  overallProgress: Number, // 0-100 percentage
  modules: [{
    moduleId: ObjectId,    // Reference to module
    pass: Boolean,         // Module pass status
    videos: [{
      videoId: String,     // Video identifier
      videoTitle: String,  // Video title
      pass: Boolean,       // Video pass status
      watchTime: Number,   // Seconds watched
      totalDuration: Number, // Total video duration
      progress: Number,    // 0-100 percentage
      completed: Boolean,  // Completion status
      lastWatched: Date,   // Last watch timestamp
      completedAt: Date    // Completion timestamp
    }]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### User Activity Log Collection

```javascript
{
  userId: String,           // User identifier
  trainingId: ObjectId,     // Training reference
  moduleId: ObjectId,       // Module reference
  videoId: String,          // Video identifier
  action: String,           // Action type (started, paused, completed)
  timestamp: Date,          // Action timestamp
  progress: Number,         // Progress percentage
  watchTime: Number,        // Watch time in seconds
  source: String,           // Source (external_website, lms_platform)
  metadata: Mixed,          // Additional data
  createdAt: Date           // Creation timestamp
}
```

## 🎨 Frontend Integration

### Progress Tracker Component

The `ProgressTracker` React component provides real-time progress visualization:

```jsx
import ProgressTracker from './components/TrainingConsumption/ProgressTracker';

function VideoPage({ userId, trainingId, moduleId, videoId }) {
  return (
    <div>
      <ProgressTracker
        userId={userId}
        trainingId={trainingId}
        moduleId={moduleId}
        videoId={videoId}
        onProgressUpdate={(data) => console.log('Progress updated:', data)}
      />

      <video controls>
        {/* Your video content */}
      </video>
    </div>
  );
}
```

### Component Features

- **Real-time progress bars** for video, module, and overall training
- **Status indicators** with color coding
- **Automatic updates** every 30 seconds
- **Error handling** with retry functionality
- **Responsive design** for mobile devices
- **Dark theme support**

## 🌐 External Website Integration

### Quick Integration (3 Steps)

1. **Include the script:**
```html
<script src="http://localhost:3000/lms-progress-integration.js"></script>
```

2. **Initialize the tracker:**
```javascript
const tracker = window.initializeLMSProgressTracker({
    userId: '68aab7310e17c845daa50352',
    trainingId: '68ab07279782e8652d5b0e1c',
    moduleId: '68173662b95f4caae809067e',
    apiUrl: 'http://localhost:7000/api'
});
```

3. **Add data attributes to videos:**
```html
<video
  data-video-id="video_001"
  data-lms-video-id="video_001"
  controls>
  <source src="video.mp4" type="video/mp4">
</video>
```

### Advanced Integration

```javascript
// Manual progress tracking
tracker.trackProgress('started', 0, 300, 'video_001');
tracker.trackProgress('completed', 300, 300, 'video_001');

// Event handling
tracker.on('progressUpdated', (data) => {
    console.log('Progress updated:', data);
});

tracker.on('progressError', (error) => {
    console.error('Progress error:', error);
});

// Get current progress
const progress = await tracker.getProgress();
```

## ⚙️ Installation & Setup

### Backend Setup

1. **Install dependencies** (if needed):
```bash
cd backend
npm install
```

2. **Ensure MongoDB collections exist:**
   - `trainings` - Your existing training data
   - `modules` - Your existing module data
   - `trainingprogresses` - Will be created automatically
   - `useractivitylogs` - Will be created automatically

3. **Start the server:**
```bash
npm start
```

### Frontend Setup

1. **Include the integration script:**
```html
<script src="http://localhost:3000/lms-progress-integration.js"></script>
```

2. **Import React components** (if using React):
```javascript
import ProgressTracker from './components/TrainingConsumption/ProgressTracker';
```

3. **Configure API endpoints** if needed:
```javascript
const config = {
    apiUrl: 'https://your-lms-api.com/api' // Change if needed
};
```

## 📚 Usage Examples

### Basic Video Page Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>Training Video</title>
    <script src="http://localhost:3000/lms-progress-integration.js"></script>
</head>
<body>
    <div id="progress-container"></div>

    <video
        id="training-video"
        data-video-id="safety_video_001"
        controls
        poster="video-poster.jpg">
        <source src="training-video.mp4" type="video/mp4">
    </video>

    <script>
        // Initialize tracker
        const tracker = window.initializeLMSProgressTracker({
            userId: 'current-user-id',
            trainingId: 'current-training-id',
            moduleId: 'current-module-id',
            apiUrl: 'http://localhost:7000/api'
        });

        // Load progress component
        const progressContainer = document.getElementById('progress-container');
        // You can embed the React ProgressTracker component here
    </script>
</body>
</html>
```

### React Application Integration

```jsx
import React, { useEffect, useRef } from 'react';
import ProgressTracker from './components/ProgressTracker';

function TrainingVideoPlayer({ videoData }) {
    const videoRef = useRef(null);

    useEffect(() => {
        // Initialize external tracker if needed
        if (window.initializeLMSProgressTracker) {
            const tracker = window.initializeLMSProgressTracker({
                userId: videoData.userId,
                trainingId: videoData.trainingId,
                moduleId: videoData.moduleId,
                autoTrack: true
            });
        }
    }, [videoData]);

    return (
        <div className="video-player">
            <ProgressTracker
                userId={videoData.userId}
                trainingId={videoData.trainingId}
                moduleId={videoData.moduleId}
                videoId={videoData.videoId}
            />

            <video
                ref={videoRef}
                data-video-id={videoData.videoId}
                controls
                poster={videoData.poster}>
                <source src={videoData.src} type="video/mp4" />
            </video>
        </div>
    );
}
```

## 🔧 Troubleshooting

### Common Issues

**1. Progress not updating:**
- Check that `userId`, `trainingId`, and `moduleId` are correctly set
- Verify API endpoint URLs are accessible
- Check browser console for JavaScript errors

**2. API connection failed:**
- Ensure backend server is running on the correct port
- Check CORS settings if accessing from different domains
- Verify API endpoints are correctly configured

**3. Video not auto-tracked:**
- Ensure video elements have proper `data-video-id` attributes
- Check that the integration script loads before video elements
- Verify video events are firing correctly

**4. Progress data not persisting:**
- Check MongoDB connection and database access
- Verify collection permissions
- Check for database connection errors in server logs

### Debug Mode

Enable debug logging:

```javascript
const tracker = window.initializeLMSProgressTracker({
    // ... other config
    debug: true
});
```

### API Testing

Test API endpoints directly:

```bash
# Test progress retrieval
curl http://localhost:7000/api/training/user-progress/USER_ID

# Test progress update
curl -X POST http://localhost:7000/api/training/update-video-progress \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","trainingId":"TRAINING_ID","moduleId":"MODULE_ID","videoId":"VIDEO_ID","action":"started"}'
```

## 📊 Analytics & Reporting

The system provides comprehensive analytics:

- **Video completion rates** by training/module
- **User engagement metrics** (watch time, pauses, resumes)
- **Progress trends** over time
- **Drop-off points** in video content

Use the activity logs to generate detailed reports for compliance and training effectiveness analysis.

## 🔒 Security Considerations

- **Validate user authentication** before allowing progress updates
- **Sanitize input data** to prevent injection attacks
- **Rate limit API calls** to prevent abuse
- **Use HTTPS** in production environments
- **Implement proper CORS policies** for external website access

## 📝 License

This integration system is part of your LMS platform. Please refer to your main project license for usage terms.

---

## 🎉 Getting Started

1. **Set up the backend APIs** (already done ✅)
2. **Include the integration script** in your external website
3. **Initialize the tracker** with your configuration
4. **Add data attributes** to video elements
5. **Test the integration** using the example file

For detailed examples, see `frontend/public/external-website-example.html`

---

**Need help?** Check the troubleshooting section or examine the example implementations for guidance.
