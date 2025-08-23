# 🚀 LMS Web App Setup Instructions

## Overview
This web application is designed to display trainings assigned to users from your existing training assignment system. It's specifically created for iOS users who need a web-based interface to view their trainings.

## 🔧 Configuration Steps

### 1. Update API Configuration
Edit `frontend/src/config.js` and update the following:

```javascript
export const config = {
  // API Configuration - Already set to your system
  API_BASE_URL: 'https://lms-testenv.onrender.com',
  
  // Authentication - JWT Bearer token
  USE_AUTH: true,
  API_TOKEN: process.env.REACT_APP_API_TOKEN || 'your-jwt-token-here',
  
  // API Endpoints - Already configured for your system
  ENDPOINTS: {
    GET_ALL_USER_TRAININGS: '/api/get/Full/allusertraining',
    GET_USER_TRAININGS_WITH_COMPLETION: '/api/get/allusertraining',
    GET_MANDATORY_TRAININGS: '/api/get/mandatory/allusertraining',
    GET_TRAINING_BY_ID: '/api/trainings/:id',
    GET_ALL_ASSESSMENTS: '/api/user/get/AllAssessment',
    GET_ASSESSMENT_DETAILS: '/api/user/get/assessment/details/:id',
    GET_ALL_MODULES: '/api/modules',
  }
};
```

### 2. Set Your JWT Token
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_TOKEN=your-actual-jwt-token-here
```

**To get your JWT token:**
1. Log into your existing training system
2. Check browser developer tools → Network tab
3. Look for API requests and find the `Authorization: Bearer <token>` header
4. Copy the token value (without "Bearer ")

### 3. API Endpoints Already Configured
Your system provides these endpoints (already configured):

#### Core Training Endpoints:
- **GET** `/api/get/Full/allusertraining` - Get all user trainings
- **GET** `/api/get/allusertraining` - Get user trainings with completion
- **GET** `/api/get/mandatory/allusertraining` - Get mandatory trainings

#### Assessment Endpoints:
- **GET** `/api/user/get/AllAssessment` - Get all assessments
- **GET** `/api/user/get/assessment/details/:id` - Get assessment details

#### Module Endpoints:
- **GET** `/api/modules` - Get all modules

## 🧪 Testing the Connection

### 1. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Test API Connection
1. Open the Training page in your browser
2. Use the "Debug & Testing" section to:
   - Click "Test Endpoints" to check all available endpoints
   - Use "Refresh" to test the API connection
   - Check console logs for detailed information

### 3. Check Console Logs
Open browser developer tools (F12) and check the console for:
- API request/response logs
- Data transformation logs
- Error messages
- Debug information

## 🔍 Troubleshooting

### Common Issues:

#### 1. "API connection failed"
- Check if your JWT token is correct in `.env` file
- Verify the token hasn't expired
- Check if CORS is enabled on your backend

#### 2. "No trainings found"
- Verify your API endpoints are working
- Check if there are trainings in your system
- Ensure the JWT token has proper permissions

#### 3. "CORS error"
- Your backend needs to allow requests from the frontend domain
- Add CORS headers to your API responses

#### 4. "Authentication failed"
- Check if `USE_AUTH` is set to `true` in config.js
- Verify the `REACT_APP_API_TOKEN` in your `.env` file
- Ensure the token format is correct (no "Bearer " prefix)

### Debug Steps:
1. **Check Network Tab**: Look for failed API requests
2. **Verify Endpoints**: Use the "Test Endpoints" button
3. **Check Token**: Ensure JWT token is valid and not expired
4. **Test with Postman**: Verify your API works outside the frontend

## 📱 User Experience

### For iOS Users:
- The web app is designed to be mobile-friendly
- Users can view their assigned and mandatory trainings
- Progress tracking and completion status are displayed
- Responsive design works on all screen sizes

### Features:
- **Assigned Trainings**: Shows all trainings from your API
- **Mandatory Trainings**: Highlights required trainings
- **Progress Tracking**: Visual progress bars and completion status
- **Deadline Management**: Shows training deadlines and overdue status
- **Module Information**: Displays training modules and structure

## 🚀 Production Deployment

### 1. Environment Variables
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_TOKEN=your-production-jwt-token
```

### 2. Build and Deploy
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your web server
```

### 3. Security Considerations
- Use HTTPS in production
- Ensure JWT tokens are secure and properly managed
- Rate limit API requests
- Validate user input

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your JWT token is valid
3. Test the API independently using Postman or similar tools
4. Ensure CORS and authentication are properly configured

## 🔄 Updates and Maintenance

To update the system:
1. Modify `frontend/src/config.js` for API changes
2. Update JWT token in `.env` file when needed
3. Test thoroughly before deploying to production
4. Monitor API performance and user feedback

## 📊 Data Structure

Your API returns data in this format:
```json
{
  "data": [
    {
      "_id": "training_id",
      "trainingName": "Training Name",
      "description": "Training Description",
      "modules": ["module_id_1", "module_id_2"],
      "numberOfModules": 2,
      "deadline": 1234567890,
      "Trainingtype": "Assigned",
      "Assignedfor": ["Normal"],
      "createdBY": "admin",
      "createdDate": "2024-01-01T00:00:00.000Z",
      "editedDate": "2024-01-01T00:00:00.000Z",
      "averageCompletionPercentage": 75
    }
  ]
}
```

The frontend automatically transforms this data to display properly in the UI.
