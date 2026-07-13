# How to Set Up a Manager Account

## The Problem
When you login, the buttons appear disabled because the app detects your role as "employee" instead of "manager".

## Solution: Update Your Role in Firestore

### Option 1: Via Firebase Console (Easiest)

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/project/dan-the-moving-man-61555/firestore

2. **Find Your User Document**
   - Click on `users` collection
   - Find your user document (search by email or user ID)

3. **Edit the Role Field**
   - Click on your user document
   - Find the `role` field
   - Change the value from `"employee"` to `"manager"`
   - Click "Update"

4. **Refresh the App**
   - Go back to your app
   - Refresh the page (F5)
   - You should now see manager options enabled!

### Option 2: Create a New Manager Account

1. **Sign Up with Email**
   - Go to the app
   - Click "Sign Up"
   - Enter your details
   - Complete signup (will be created as employee)

2. **Update Role in Firestore**
   - Follow Option 1 steps above to change role to "manager"

3. **Log Out and Log Back In**
   - Click logout in the app
   - Log back in with your credentials
   - Manager features should now be enabled!

## Verify Manager Access

Once you've updated the role, you should see:

### Home Dashboard
- ✅ "Issue Written Warning" button - **ENABLED** (black button)
- ✅ "Add Employee" button - **ENABLED** (white button)
- ✅ "Generate Report" button - **ENABLED** (white button)

### Employee Directory
- ✅ "Onboard Mover" button appears in header
- ✅ "Issue Warning" button on each employee card
- ✅ "Block" and "Delete" buttons on each employee card
- ✅ Email button (available to all users)

### Sidebar
- ✅ "Reports" tab (instead of "Compliance")
- ✅ User badge shows "manager Account"

## Debug Mode

If you still see disabled buttons after updating:

1. **Open Browser Console**
   - Press F12
   - Go to "Console" tab

2. **Check Debug Logs**
   - Look for logs like:
   ```
   HomeDashboard - Current User: {name: "...", role: "manager", ...}
   HomeDashboard - Is Manager: true
   HomeDashboard - User Role: manager
   ```

3. **If Role Shows "employee"**
   - Double-check Firestore - make sure you saved the changes
   - Try logging out and back in
   - Clear browser cache (Ctrl+Shift+Delete)

## Firestore User Document Structure

Your user document should look like this for manager access:

```json
{
  "name": "Dan Stevens",
  "email": "dan@movingdan.com",
  "role": "manager",  // ← This must be "manager"
  "title": "Owner / Operations Manager",
  "avatar": "DS",
  "phone": "",
  "createdAt": "2024-...",
  "emailNotificationsEnabled": true,
  "weeklyDigestEnabled": true
}
```

## Common Issues

### Issue 1: Buttons Still Disabled After Update
**Solution:** 
- Log out completely
- Close all browser tabs
- Open new tab and log back in

### Issue 2: Can't Find My User in Firestore
**Solution:**
- Click on "users" collection
- Look for a document with your email in the data
- The document ID is your Firebase Auth UID

### Issue 3: Role Field Doesn't Exist
**Solution:**
- Click "Add field"
- Field name: `role`
- Field type: `string`
- Field value: `manager`
- Click "Add"

## Need Help?

If you're still having issues:
1. Check browser console for errors (F12)
2. Verify Firebase Authentication shows your user
3. Verify Firestore has your user document with correct role
4. Try creating a completely new account and setting it as manager
