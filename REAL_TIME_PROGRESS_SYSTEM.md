# 🚀 Real-Time Training Progress System

## 📊 Database Structure Analysis (From Your MongoDB)

Based on your MongoDB Compass screenshot, here's the exact structure:

```javascript
// Collection: trainingprogresses
{
  "_id": ObjectId("68a72d39ec715185976814bb"),
  "userId": ObjectId("68a6efbd0da40e3b9c29e16"),
  "trainingName": "test mandatory training for fashion consultant",
  "trainingId": ObjectId("68a72d37ec715185976813c6"),
  "pass": false,
  "status": "Pending",  // "Pending" | "In Progress" | "Completed"
  "deadline": "2025-08-24T14:29:11.351+00:00",
  "modules": [
    {
      "_id": ObjectId,
      "__v": 0
    }
  ]
}
```

## 🎯 Required APIs for Your LMS Website

### 1. **Update Training Status API** (CRITICAL)
```
PUT /api/trainingprogresses/update-status
POST /api/user/training/status
```

**Data Structure to Send:**
```javascript
{
  "userId": "68a6efbd0da40e3b9c29e16",
  "trainingId": "68a72d37ec715185976813c6", 
  "status": "In Progress",  // When video starts
  "timestamp": "2024-01-21T15:30:00.000Z",
  "action": "video_started" // or "video_paused", "video_completed"
}
```

### 2. **Real-Time Progress Update API**
```
PUT /api/trainingprogresses/:id/progress
PATCH /api/trainingprogresses/update
```

**Data Structure:**
```javascript
{
  "progressId": "68a72d39ec715185976814bb", // Document _id
  "userId": "68a6efbd0da40e3b9c29e16",
  "trainingId": "68a72d37ec715185976813c6",
  "status": "In Progress",
  "currentModule": {
    "moduleId": "module_id_here",
    "videoId": "video_id_here", 
    "watchTime": 120, // seconds watched
    "totalDuration": 300, // total video duration
    "percentageWatched": 40
  },
  "lastActivity": "2024-01-21T15:30:00.000Z"
}
```

## 🛠 Implementation for Your Training Website

### Step 1: Create Real-Time Progress Tracker
```javascript
// Add to frontend/src/services/progressTracker.js
class RealTimeProgressTracker {
  constructor(userId, trainingId, trainingName) {
    this.userId = userId;
    this.trainingId = trainingId;
    this.trainingName = trainingName;
    this.progressId = null;
    this.currentStatus = 'Pending';
    this.lastUpdate = null;
    this.updateInterval = null;
  }

  // Start tracking when user opens training
  async startTracking() {
    console.log('🎯 Starting real-time progress tracking...');
    
    try {
      // Create or get progress record
      const response = await this.createProgressRecord();
      this.progressId = response.progressId;
      
      // Update status to "In Progress"
      await this.updateStatus('In Progress');
      
      console.log('✅ Progress tracking started');
    } catch (error) {
      console.error('❌ Failed to start tracking:', error);
    }
  }

  // Update status when video events occur
  async updateStatus(newStatus, additionalData = {}) {
    if (this.currentStatus === newStatus) return;
    
    this.currentStatus = newStatus;
    this.lastUpdate = new Date().toISOString();

    const updateData = {
      userId: this.userId,
      trainingId: this.trainingId,
      status: newStatus,
      timestamp: this.lastUpdate,
      ...additionalData
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/trainingprogresses/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        console.log(`✅ Status updated to: ${newStatus}`);
      } else {
        console.error('❌ Status update failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Status update error:', error);
    }
  }

  // Track video watching progress
  async trackVideoProgress(videoId, currentTime, duration) {
    const percentageWatched = Math.round((currentTime / duration) * 100);
    
    const progressData = {
      progressId: this.progressId,
      userId: this.userId,
      trainingId: this.trainingId,
      currentModule: {
        videoId: videoId,
        watchTime: Math.round(currentTime),
        totalDuration: Math.round(duration),
        percentageWatched: percentageWatched
      },
      lastActivity: new Date().toISOString()
    };

    try {
      await fetch(`${API_BASE_URL}/api/trainingprogresses/update-progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`
        },
        body: JSON.stringify(progressData)
      });
    } catch (error) {
      console.error('❌ Progress update error:', error);
    }
  }

  // Create initial progress record
  async createProgressRecord() {
    const recordData = {
      userId: this.userId,
      trainingId: this.trainingId,
      trainingName: this.trainingName,
      status: 'Pending',
      pass: false,
      deadline: null, // Set based on your requirements
      modules: []
    };

    const response = await fetch(`${API_BASE_URL}/api/trainingprogresses/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      },
      body: JSON.stringify(recordData)
    });

    return response.json();
  }

  // Stop tracking (when user leaves or completes)
  async stopTracking(finalStatus = 'Pending') {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    await this.updateStatus(finalStatus);
    console.log('🛑 Progress tracking stopped');
  }
}
```

### Step 2: Integrate with Video Player
```javascript
// Update frontend/src/components/VideoPlayer.jsx
import { RealTimeProgressTracker } from '../services/progressTracker';

const VideoPlayer = ({ video, trainingId, userId }) => {
  const [progressTracker, setProgressTracker] = useState(null);

  useEffect(() => {
    // Initialize tracker when video loads
    const tracker = new RealTimeProgressTracker(userId, trainingId, video.title);
    setProgressTracker(tracker);
    
    // Start tracking
    tracker.startTracking();

    return () => {
      // Cleanup when component unmounts
      if (tracker) {
        tracker.stopTracking();
      }
    };
  }, [video, trainingId, userId]);

  // Video event handlers
  const handleVideoPlay = () => {
    if (progressTracker) {
      progressTracker.updateStatus('In Progress', {
        action: 'video_started',
        videoId: video._id
      });
    }
  };

  const handleVideoPause = () => {
    if (progressTracker) {
      progressTracker.updateStatus('In Progress', {
        action: 'video_paused',
        videoId: video._id
      });
    }
  };

  const handleTimeUpdate = (e) => {
    const video = e.target;
    if (progressTracker && video.duration) {
      // Update progress every 5 seconds
      progressTracker.trackVideoProgress(
        video._id,
        video.currentTime,
        video.duration
      );
    }
  };

  const handleVideoComplete = () => {
    if (progressTracker) {
      progressTracker.updateStatus('Completed', {
        action: 'video_completed',
        videoId: video._id
      });
    }
  };

  return (
    <video
      onPlay={handleVideoPlay}
      onPause={handleVideoPause}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleVideoComplete}
      controls
    >
      <source src={video.videoUri} />
    </video>
  );
};
```

## 🔧 APIs You Need to Create in Your LMS Project

### 1. **Create/Update Training Progress**
```javascript
// Route: PUT /api/trainingprogresses/update-status
app.put('/api/trainingprogresses/update-status', async (req, res) => {
  try {
    const { userId, trainingId, status, timestamp, action } = req.body;

    // Find existing progress record
    let progress = await TrainingProgress.findOne({
      userId: userId,
      trainingId: trainingId
    });

    if (!progress) {
      // Create new progress record
      progress = new TrainingProgress({
        userId: userId,
        trainingId: trainingId,
        trainingName: req.body.trainingName || 'Training',
        status: status,
        pass: false,
        deadline: req.body.deadline || null,
        modules: [],
        lastActivity: timestamp
      });
    } else {
      // Update existing record
      progress.status = status;
      progress.lastActivity = timestamp;
    }

    await progress.save();

    res.json({
      success: true,
      progressId: progress._id,
      status: progress.status
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 2. **Real-Time Progress Update**
```javascript
// Route: PUT /api/trainingprogresses/update-progress
app.put('/api/trainingprogresses/update-progress', async (req, res) => {
  try {
    const { progressId, userId, trainingId, currentModule, lastActivity } = req.body;

    const progress = await TrainingProgress.findById(progressId);
    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    // Update current module progress
    progress.currentModule = currentModule;
    progress.lastActivity = lastActivity;

    // Auto-update status based on activity
    if (currentModule.percentageWatched > 0) {
      progress.status = 'In Progress';
    }
    if (currentModule.percentageWatched >= 100) {
      progress.status = 'Completed';
      progress.pass = true;
    }

    await progress.save();

    res.json({
      success: true,
      progress: progress
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 3. **Get Current Progress**
```javascript
// Route: GET /api/trainingprogresses/user/:userId
app.get('/api/trainingprogresses/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progresses = await TrainingProgress.find({ userId: userId })
      .populate('trainingId')
      .sort({ lastActivity: -1 });

    res.json({
      success: true,
      data: progresses
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: error.message });
  }
});
```

## 📋 Data You Need to Extract/Provide

### From Your Training Website:
1. **User Data:**
   - `userId`: `"68a6efbd0da40e3b9c29e16"`
   - `username`: `"Revathy"`
   - `employeeId`: From login

2. **Training Data:**
   - `trainingId`: `"68a72d37ec715185976813c6"`
   - `trainingName`: `"test mandatory training for fashion consultant"`
   - `deadline`: Training deadline if applicable

3. **Video Progress Data:**
   - `videoId`: Current video ID
   - `currentTime`: Seconds watched
   - `totalDuration`: Total video length
   - `percentageWatched`: Calculated percentage

4. **Activity Timestamps:**
   - When video starts
   - When video is paused
   - When video is completed
   - Last activity time

### For Your LMS Database:
- Collection: `trainingprogresses`
- Status values: `"Pending"`, `"In Progress"`, `"Completed"`
- Real-time updates every 5-10 seconds during video watching

## 🎯 Complete Integration Flow

1. **User Opens Training** → Create progress record with status "Pending"
2. **User Starts Video** → Update status to "In Progress"
3. **During Video Watch** → Send progress updates every 5 seconds
4. **User Pauses Video** → Maintain "In Progress" with pause timestamp
5. **User Completes Video** → Update status to "Completed"

This system will give you real-time updates in your MongoDB database just like your mobile app! 🚀
