# Testing Guide - Manager User Creation Flow

## How to Test User Creation by Manager

### Step 1: Login as Manager
1. Open the app at http://localhost:3000
2. If you need to create a manager account first:
   - Sign up with email (this will be an employee by default)
   - Go to Firebase Console → Firestore → users collection
   - Find your user document
   - Change `role` field from `"employee"` to `"manager"`
   - Refresh the app

### Step 2: Navigate to Add Employee
1. Once logged in as manager, you'll see the manager dashboard
2. Click on "Directory" tab in the sidebar
3. Click the "Onboard Mover" button (red button in top right)

### Step 3: Fill Out Employee Form
1. **Full Name**: Enter employee name (e.g., "John Smith")
2. **Email Address**: Enter email (e.g., "john@movingdan.com")
3. **Phone**: Optional
4. **Title/Position**: e.g., "Professional Mover"
5. **Access Role**: Select "Mover (Employee)"
6. **Start Date**: Select a date
7. **Initial Login Password**: Enter password (minimum 6 characters)
8. Click "Create Crew Account"

### Step 4: Verify Account Creation
1. You should see "Employee Created!" message
2. Manager stays logged in (not logged out)
3. Check Firebase Console → Authentication → Users
   - You should see the new user account
4. Check Firebase Console → Firestore → users collection
   - You should see the user document with role "employee"

### Step 5: Test New Employee Login
1. Open a new incognito/private window
2. Go to http://localhost:3000
3. Click "Sign In"
4. Enter the new employee's email and password
5. You should be able to login successfully!

## Common Issues & Solutions

### Issue 1: "Failed to create user account"
**Solution:** Make sure Firebase Authentication is enabled in Firebase Console

### Issue 2: "Email already in use"
**Solution:** Use a different email or delete the existing user from Firebase Console

### Issue 3: "Password too weak"
**Solution:** Use at least 6 characters for the password

### Issue 4: Manager gets logged out after creating user
**Solution:** This should be fixed now. If it still happens, check:
- API route `/api/admin/create-user` is working
- Check browser console for errors

## User Management Features

### Block User
1. Go to Directory tab as manager
2. Find the employee card
3. Click "Block" button
4. User will be unable to login (requires Firebase Admin SDK in production)

### Delete User
1. Go to Directory tab as manager
2. Find the employee card
3. Click "Delete" button
4. Confirm the deletion
5. User will be removed from Firestore and Authentication

### Issue Warning
1. Go to Directory tab as manager
2. Find the employee card
3. Click "Issue Warning" button
4. Fill out the warning form
5. Submit to create a written warning

## Notes

- The API routes use Firebase REST API (not Admin SDK yet)
- For production, replace with Firebase Admin SDK
- All operations are saved to Firebase and persist across sessions
- Created users can immediately log in with their credentials
