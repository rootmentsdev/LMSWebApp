# 🚀 LMS Backend Setup Guide

## ✅ What I've Created for You

I've successfully added all the missing GET endpoints to your backend! Here's what's now available:

### 🔌 New Training Endpoints

1. **GET** `/api/trainings/all` - Get all regular trainings
2. **GET** `/api/trainings/mandatorytrainings/all` - Get all mandatory trainings  
3. **GET** `/api/trainings/user/:userId/assigned-trainings` - Get user's assigned trainings
4. **GET** `/api/trainings/user/:userId/mandatory-trainings` - Get user's mandatory trainings

### 📁 New Files Created

- `backend/models/Training.js` - MongoDB training model
- `backend/controllers/trainingController.js` - Training business logic
- `backend/routes/trainingRoutes.js` - Training API routes
- `backend/config/database.js` - MongoDB connection
- `backend/test-endpoints.js` - Test script for endpoints
- Updated `backend/server.js` - Now includes all training endpoints
- Updated `frontend/src/api.js` - Now works with local backend

## 🛠️ Setup Steps

### Step 1: Create Environment File

Create a `.env` file in your `backend` directory:

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

### Step 2: Install MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
# Download and install MongoDB from https://www.mongodb.com/try/download/community
# Or use MongoDB Atlas (cloud service)
```

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Step 3: Start Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
📱 API Health Check: http://localhost:5000/api/health
🔐 Employee Verification: http://localhost:5000/api/verify-employee
📚 Training Endpoints:
   GET /api/trainings/all
   GET /api/trainings/mandatorytrainings/all
   GET /api/trainings/user/:userId/assigned-trainings
   GET /api/trainings/user/:userId/mandatory-trainings
   POST /api/trainings
   POST /api/trainings/mandatorytrainings
```

### Step 4: Test Endpoints

Run the test script to verify everything works:

```bash
cd backend
node test-endpoints.js
```

## 🧪 Testing with Postman

### 1. Health Check
```
GET http://localhost:5000/api/health
```

### 2. Get All Trainings
```
GET http://localhost:5000/api/trainings/all
```

### 3. Get User Trainings
```
GET http://localhost:5000/api/trainings/user/user123/assigned-trainings
GET http://localhost:5000/api/trainings/user/user123/mandatory-trainings
```

### 4. Create Sample Training
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

## 🎯 What This Fixes

### Before (404 Errors):
- ❌ Frontend couldn't fetch trainings
- ❌ Missing GET endpoints for user trainings
- ❌ No way to retrieve training data

### After (Working System):
- ✅ All training endpoints available
- ✅ Frontend can fetch user trainings
- ✅ Training creation and assignment works
- ✅ Progress tracking enabled
- ✅ MongoDB persistence

## 🔄 How It Works Now

1. **Frontend** calls `/api/trainings/user/user123/assigned-trainings`
2. **Backend** queries MongoDB for trainings assigned to that user
3. **Response** includes training data with user-specific progress
4. **Frontend** displays trainings with progress bars and deadlines

## 🚨 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# Or check service status
sudo systemctl status mongodb
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change PORT in .env file
PORT=5001
```

### CORS Errors
- Ensure frontend is running on `http://localhost:5173`
- Check `CORS_ORIGIN` in `.env` file

## 🎉 Next Steps

1. **Start your backend**: `npm run dev` in backend directory
2. **Test endpoints**: Use Postman or run `node test-endpoints.js`
3. **Start your frontend**: `npm run dev` in frontend directory
4. **Navigate to Training page**: Should now show trainings (or empty state if none exist)
5. **Create trainings**: Use the POST endpoints to create sample data

## 📞 Need Help?

If you encounter issues:
1. Check backend console for error messages
2. Verify MongoDB is running
3. Test endpoints with Postman first
4. Check browser console for frontend errors

---

**Your LMS system is now complete with all the missing training endpoints! 🎓**
