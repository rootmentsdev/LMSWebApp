# LMS Backend API

Backend server for the Learning Management System (LMS) with training and assessment management capabilities.

## 🚀 Features

- **Employee Authentication**: Integration with external employee verification API
- **Training Management**: Create, assign, and track regular and mandatory trainings
- **User Progress Tracking**: Monitor training completion and progress
- **MongoDB Integration**: Persistent data storage for trainings and users
- **RESTful API**: Clean, consistent API endpoints

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the backend directory with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/lms_database

# External API Configuration
API_TOKEN=RootX-production-9d17d9485eb772e79df8564004d4a4d4
EXTERNAL_API_URL=https://rootments.in/api/verify_employee

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Start MongoDB service
mongod
```

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000
```

### Core Endpoints

#### Health Check
- **GET** `/api/health` - Check API and database status

#### Employee Verification
- **POST** `/api/verify-employee` - Verify employee credentials

### Training Management

#### Admin Endpoints
- **GET** `/api/trainings/all` - Get all regular trainings
- **GET** `/api/trainings/mandatorytrainings/all` - Get all mandatory trainings
- **POST** `/api/trainings` - Create new regular training
- **POST** `/api/trainings/mandatorytrainings` - Create new mandatory training

#### User Endpoints
- **GET** `/api/trainings/user/:userId/assigned-trainings` - Get user's assigned trainings
- **GET** `/api/trainings/user/:userId/mandatory-trainings` - Get user's mandatory trainings
- **PUT** `/api/trainings/user/:userId/training/:trainingId/progress` - Update training progress
- **PUT** `/api/trainings/user/:userId/training/:trainingId/complete` - Mark training as completed

### Backward Compatibility
- **GET** `/api/mandatorytrainings` - Redirects to new endpoint

## 📊 Data Models

### Training Schema
```javascript
{
  title: String,           // Training title
  description: String,      // Training description
  type: String,            // 'regular' or 'mandatory'
  modules: Array,          // Training modules
  duration: Number,         // Duration in days
  assignedUsers: Array,    // Users assigned to this training
  targetCriteria: Object,  // Branch/role/designation criteria
  createdBy: String,       // Creator's ID
  isActive: Boolean        // Training status
}
```

### User Assignment Schema
```javascript
{
  userId: String,          // User ID
  userName: String,        // User name
  userRole: String,        // User role
  userBranch: String,      // User branch
  assignedDate: Date,      // Assignment date
  deadline: Date,          // Completion deadline
  progress: Number,        // Progress percentage (0-100)
  status: String,          // 'pending', 'in_progress', 'completed'
  completedDate: Date      // Completion date
}
```

## 🧪 Testing with Postman

### 1. Test Health Check
```
GET http://localhost:5000/api/health
```

### 2. Test Training Endpoints
```
GET http://localhost:5000/api/trainings/all
GET http://localhost:5000/api/trainings/mandatorytrainings/all
GET http://localhost:5000/api/trainings/user/user123/assigned-trainings
GET http://localhost:5000/api/trainings/user/user123/mandatory-trainings
```

### 3. Test Training Creation
```
POST http://localhost:5000/api/trainings
Content-Type: application/json

{
  "title": "Customer Service Excellence",
  "description": "Learn essential customer service skills",
  "duration": 5,
  "modules": [
    {
      "moduleId": "mod_001",
      "moduleName": "Introduction to Customer Service",
      "moduleOrder": 1
    }
  ],
  "targetCriteria": {
    "branches": ["Sales", "Support"],
    "roles": ["Representative", "Manager"]
  },
  "createdBy": "admin123"
}
```

### 4. Test Progress Update
```
PUT http://localhost:5000/api/trainings/user/user123/training/TRAINING_ID/progress
Content-Type: application/json

{
  "progress": 75
}
```

## 🔧 Database Operations

### MongoDB Connection
The server automatically connects to MongoDB using the `MONGODB_URI` environment variable.

### Sample Data Creation
You can create sample trainings using the POST endpoints above. The system will automatically:
- Generate unique IDs
- Set creation timestamps
- Validate required fields
- Handle user assignments

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env` file
   - Verify network connectivity

2. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill existing process on port 5000

3. **CORS Errors**
   - Verify `CORS_ORIGIN` in `.env` file
   - Ensure frontend URL matches

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed logging.

## 📈 Performance

- **Database Indexing**: Automatic indexing on frequently queried fields
- **Connection Pooling**: Efficient MongoDB connection management
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: Input validation and sanitization

## 🔒 Security

- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Sensitive information is not exposed in errors
- **CORS**: Configurable CORS settings for frontend integration
- **Rate Limiting**: Built-in protection against abuse

## 🚀 Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set appropriate CORS origins
4. Use process manager (PM2, Forever)

### Environment Variables
Ensure all required environment variables are set in production.

## 📞 Support

For issues or questions:
1. Check the server logs
2. Verify environment variables
3. Test endpoints with Postman
4. Check MongoDB connection status

---

**Happy Coding! 🎓**
