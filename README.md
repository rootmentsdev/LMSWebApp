# LMS Web Application

A Learning Management System (LMS) web application built with React and Node.js for managing trainings and assessments.

## 🚀 Features

- **Training Management**: Create, assign, and track regular and mandatory trainings
- **Assessment Management**: Assign assessments to users with deadlines
- **User Progress Tracking**: Monitor training completion and progress
- **Responsive Design**: Mobile-first design with React-Bootstrap
- **API Integration**: RESTful API endpoints for all operations

## 🏗️ Project Structure

```
LMSWebApp/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── api.js          # API service functions
│   │   └── App.jsx         # Main application component
│   └── package.json
├── backend/                 # Node.js backend server
│   ├── server.js           # Express server setup
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:5173`

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start server:**
   ```bash
   npm start
   ```

## 🔌 API Endpoints

### Training Management

- **POST** `/api/trainings` - Create regular training and assign to users by branch/role
- **POST** `/api/mandatorytrainings` - Create mandatory training and assign to users by designation
- **POST** `/api/user/reassign/training` - Reassign existing training to users
- **POST** `/api/user/assign-module` - Assign individual modules to users

### Assessment Management

- **POST** `/api/user/assign-assessment` - Assign assessments to users

### User Training Retrieval (Need to be implemented)

- **GET** `/api/user/:userId/assigned-trainings` - Get user's assigned trainings
- **GET** `/api/user/:userId/mandatory-trainings` - Get user's mandatory trainings
- **GET** `/api/trainings/all` - Get all trainings (admin view)
- **GET** `/api/mandatorytrainings/all` - Get all mandatory trainings (admin view)

## 📱 Pages

### 1. Training Page (`/training`)
- **Tabs**: Assigned and Mandatory trainings
- **Sections**: Pending and Completed trainings
- **Features**: Progress bars, deadline tracking, API connection testing
- **Design**: Clean white background with modern UI

### 2. Assessment Page (`/assessment`)
- **Features**: List available assessments, assign to users
- **Modal**: Assignment form with user ID and deadline
- **Design**: Consistent with Training page styling

### 3. Login Page (`/login`)
- **Authentication**: User login system
- **Protected Routes**: All other pages require authentication

## 🔧 Configuration

### API Base URL
The frontend is configured to connect to:
```
https://lms-testenv.onrender.com
```

### Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=https://lms-testenv.onrender.com
```

## 🚨 Current Issues & Solutions

### Issue: 404 Errors on Training Page
**Problem**: The frontend is trying to fetch trainings from endpoints that don't exist yet.

**Solution**: You need to implement these GET endpoints in your backend:

```javascript
// In your backend routes
app.get('/api/user/:userId/assigned-trainings', async (req, res) => {
  // Query database for user's assigned trainings
});

app.get('/api/user/:userId/mandatory-trainings', async (req, res) => {
  // Query database for user's mandatory trainings
});
```

### Issue: Trainings Not Showing
**Problem**: Trainings created through admin forms don't appear in user view.

**Solution**: 
1. Implement the missing GET endpoints
2. Ensure proper data structure in responses
3. Check database relationships between trainings and users

## 📊 Data Structure

### Training Object
```javascript
{
  id: "training_id",
  title: "Training Name",
  deadline: "5 Days Left",
  progress: 75,
  status: "pending", // or "completed"
  type: "regular" // or "mandatory"
}
```

### Assessment Object
```javascript
{
  id: "assessment_id",
  title: "Assessment Name",
  type: "quiz", // or "practical"
  duration: "30 minutes",
  questions: 25,
  passingScore: 70,
  status: "active"
}
```

## 🎯 Next Steps

1. **Implement Missing Backend Endpoints**
   - Add GET endpoints for fetching user trainings
   - Ensure proper data relationships in database

2. **Test API Integration**
   - Use the "Test API Connection" button on Training page
   - Check browser console for detailed error information

3. **User Authentication**
   - Replace mock userId with real authentication system
   - Implement user context and session management

4. **Production Deployment**
   - Remove debug information
   - Configure proper environment variables
   - Set up production build process

## 🆘 Troubleshooting

### Common Issues

1. **Bootstrap Components Not Working**
   - Ensure Bootstrap CSS and JS are imported in `main.jsx`
   - Check that `react-bootstrap` is installed

2. **API Calls Failing**
   - Verify backend server is running
   - Check API base URL configuration
   - Use browser console to see detailed error messages

3. **Page Not Loading**
   - Check if all dependencies are installed
   - Verify React Router configuration
   - Check browser console for JavaScript errors

### Debug Tools

- **API Connection Test**: Use the "Test API Connection" button on Training page
- **Browser Console**: Check for detailed error messages and API responses
- **Network Tab**: Monitor API calls and responses in browser dev tools

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify API endpoints are working in your backend
3. Ensure all dependencies are properly installed
4. Check the troubleshooting section above

## 📝 License

This project is for internal use. Please ensure compliance with your organization's policies.
