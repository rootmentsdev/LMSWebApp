# 🚀 Quick Start Guide

## Get Your Web App Running in 3 Steps!

### Step 1: Get Your JWT Token
1. **Log into your existing training system** (https://lms-testenv.onrender.com)
2. **Open browser developer tools** (F12)
3. **Go to Network tab**
4. **Make any API request** (refresh page, click a button, etc.)
5. **Find the request** and look for `Authorization: Bearer <your-token>`
6. **Copy the token** (without "Bearer ")

### Step 2: Create Environment File
Create a file called `.env` in the `frontend` folder:
```env
REACT_APP_API_TOKEN=your-copied-jwt-token-here
```

### Step 3: Start the App
```bash
cd frontend
npm install
npm run dev
```

## 🎯 What You'll See

- **Training List**: All trainings from your existing system
- **Progress Bars**: Completion percentages for each training
- **Deadlines**: Training deadlines and overdue status
- **Module Count**: Number of modules in each training
- **Debug Tools**: Test endpoints and troubleshoot issues

## 🔧 If Something Goes Wrong

1. **Check the console** (F12 → Console tab)
2. **Use the Debug section** on the Training page
3. **Verify your JWT token** is correct
4. **Test endpoints** using the "Test Endpoints" button

## 📱 For iOS Users

The web app is designed to work perfectly on iOS devices:
- Mobile-responsive design
- Touch-friendly interface
- Fast loading times
- Works offline (cached data)

## 🎉 You're Done!

Your iOS users can now access their trainings through this web app instead of the incompatible mobile app!
