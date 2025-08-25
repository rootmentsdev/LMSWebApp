const mongoose = require('mongoose');

// Schema that matches your actual LMS data structure
const trainingLMSSchema = new mongoose.Schema({
  trainingName: {
    type: String,
    required: true
  },
  description: String,
  modules: [mongoose.Schema.Types.ObjectId], // References to Module collection
  numberOfModules: {
    type: Number,
    default: 0
  },
  deadline: Number, // Unix timestamp or days
  Trainingtype: {
    type: String,
    default: "Assigned"
  },
  Assignedfor: [String], // Array of user IDs like ["Emp257"]
  createdBY: {
    type: String,
    default: 'admin'
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  editedDate: {
    type: Date,
    default: Date.now
  }
});

// Schema for Module collection (separate collection)
const moduleLMSSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true
  },
  description: String,
  videos: [{
    title: String,
    videoUri: String, // Your field name
    questions: [{
      questionText: String,
      options: [String],
      correctAnswer: String
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enhanced TrainingProgress schema that works with your structure
const trainingProgressLMSSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  trainingName: String,
  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingLMS',
    required: true
  },
  pass: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'Pending'
  },
  deadline: Date,
  modules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ModuleLMS',
      required: true
    },
    pass: {
      type: Boolean,
      default: false
    },
    videos: [{
      videoIndex: Number, // Index in module.videos array (since videos are embedded)
      videoTitle: String,
      watchTime: {
        type: Number,
        default: 0 // seconds watched
      },
      totalDuration: Number, // total video duration in seconds
      progress: {
        type: Number,
        default: 0, // 0-100 percentage
        min: 0,
        max: 100
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date,
      lastWatchedAt: {
        type: Date,
        default: Date.now
      },
      pass: {
        type: Boolean,
        default: false
      }
    }]
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
trainingProgressLMSSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// User Activity Log Schema for tracking external website interactions
const userActivityLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingLMS',
    required: true,
    index: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModuleLMS',
    required: true
  },
  videoId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['started', 'paused', 'resumed', 'completed'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  watchTime: {
    type: Number,
    default: 0 // seconds
  },
  source: {
    type: String,
    default: 'external_website',
    enum: ['external_website', 'lms_platform', 'mobile_app']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // For additional data like device info, IP, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient querying
userActivityLogSchema.index({ userId: 1, trainingId: 1, createdAt: -1 });
userActivityLogSchema.index({ trainingId: 1, createdAt: -1 });

module.exports = {
  TrainingLMS: mongoose.model('TrainingLMS', trainingLMSSchema),
  ModuleLMS: mongoose.model('ModuleLMS', moduleLMSSchema),
  TrainingProgressLMS: mongoose.model('TrainingProgressLMS', trainingProgressLMSSchema),
  UserActivityLog: mongoose.model('UserActivityLog', userActivityLogSchema)
};

