# 🎯 Cursor Prompt for LMS Project Integration

Copy and paste this prompt into Cursor for your LMS project to extract the training progression data:

---

## Cursor Prompt:

```
I need to implement real-time training progress tracking in my LMS system that updates MongoDB when users watch videos on an external training website.

Based on my MongoDB structure in collection "trainingprogresses":
- _id: ObjectId
- userId: ObjectId  
- trainingName: String
- trainingId: ObjectId
- pass: Boolean
- status: "Pending" | "In Progress" | "Completed"
- deadline: Date
- modules: Array

I need you to:

1. CREATE API endpoints for real-time progress tracking:
   - PUT /api/trainingprogresses/update-status (update status when video starts/pauses/completes)
   - PUT /api/trainingprogresses/update-progress (track video watching progress)
   - POST /api/trainingprogresses/create (create initial progress record)
   - GET /api/trainingprogresses/user/:userId (get user's progress)

2. CREATE a TrainingProgress mongoose model with schema:
   - userId (ObjectId, ref: 'User')
   - trainingId (ObjectId, ref: 'Training') 
   - trainingName (String)
   - status (String, enum: ['Pending', 'In Progress', 'Completed'])
   - pass (Boolean, default: false)
   - deadline (Date)
   - modules (Array)
   - currentModule (Object with videoId, watchTime, totalDuration, percentageWatched)
   - lastActivity (Date)

3. IMPLEMENT controller functions:
   - updateTrainingStatus() - updates status based on video events
   - updateVideoProgress() - tracks real-time video watching
   - createProgressRecord() - creates initial record
   - getUserProgress() - retrieves user's training progress

4. ADD real-time features:
   - Auto-update status from "Pending" to "In Progress" when video starts
   - Track video watching time and percentage
   - Update to "Completed" when video is finished
   - Handle multiple concurrent video sessions

5. INCLUDE proper error handling and validation:
   - Check if progress record exists before updating
   - Validate ObjectId formats
   - Handle concurrent updates
   - Log all progress changes

6. CREATE routes with authentication middleware and proper HTTP methods

Please generate the complete implementation with:
- Mongoose model file
- Controller functions
- Route definitions  
- Error handling
- Input validation
- Real-time update logic
```

---

## Additional Context to Provide:

**Your MongoDB Collection Structure:**
```javascript
// Collection: trainingprogresses
{
  "_id": ObjectId("68a72d39ec715185976814bb"),
  "userId": ObjectId("68a6efbd0da40e3b9c29e16"), 
  "trainingName": "test mandatory training for fashion consultant",
  "trainingId": ObjectId("68a72d37ec715185976813c6"),
  "pass": false,
  "status": "Pending",
  "deadline": "2025-08-24T14:29:11.351+00:00",
  "modules": [
    {
      "_id": ObjectId,
      "__v": 0  
    }
  ]
}
```

**Expected API Calls from Training Website:**
1. When user opens training: `POST /api/trainingprogresses/create`
2. When video starts: `PUT /api/trainingprogresses/update-status` with status "In Progress"
3. During video watch: `PUT /api/trainingprogresses/update-progress` every 5 seconds
4. When video completes: `PUT /api/trainingprogresses/update-status` with status "Completed"

**Authentication Headers:**
```javascript
{
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

This prompt will help Cursor generate the complete LMS backend implementation for tracking training progress in real-time! 🚀
