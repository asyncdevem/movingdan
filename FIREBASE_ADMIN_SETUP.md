# Firebase Admin SDK Setup Guide

## Current Limitation

**Problem:** When deleting users from the app, only the Firestore document is deleted, but the Firebase Authentication account remains. This causes "email already registered" errors when trying to create a new user with the same email.

**Temporary Solution:** After deleting a user in the app, go to Firebase Console → Authentication and manually delete the auth account.

## Permanent Solution: Firebase Admin SDK

To enable complete user deletion (Firestore + Authentication), you need to set up Firebase Admin SDK.

### Step 1: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `dan-the-moving-man-61555`
3. Click gear icon ⚙️ → Project Settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file (keep it secure!)

### Step 2: Add Service Account to Environment

1. Open the downloaded JSON file
2. Copy the entire content
3. Open `.env.local` file
4. Add this line:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

**OR** (Recommended for security):

```env
FIREBASE_ADMIN_PROJECT_ID=dan-the-moving-man-61555
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@dan-the-moving-man-61555.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 3: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 4: Update Delete User API Route

Replace `/app/api/admin/delete-user/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete from Firebase Authentication
    await admin.auth().deleteUser(userId);
    
    // Delete from Firestore
    await admin.firestore().collection('users').doc(userId).delete();

    return NextResponse.json({
      success: true,
      message: 'User fully deleted (Auth + Firestore)',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
```

### Step 5: Update Create User API (Optional Enhancement)

Replace `/app/api/admin/create-user/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, title } = await request.json();

    if (!email || !password || !name || !role || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create user with Firebase Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Create Firestore document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      role,
      title,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailNotificationsEnabled: true,
      weeklyDigestEnabled: true,
    });

    return NextResponse.json({
      success: true,
      userId: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    let userMessage = error.message;
    if (error.code === 'auth/email-already-exists') {
      userMessage = 'This email is already registered';
    } else if (error.code === 'auth/invalid-email') {
      userMessage = 'Invalid email format';
    } else if (error.code === 'auth/weak-password') {
      userMessage = 'Password is too weak (minimum 6 characters)';
    }
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
```

### Step 6: Update Disable User API

Replace `/app/api/admin/disable-user/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { userId, disabled } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update Firebase Authentication
    await admin.auth().updateUser(userId, { disabled });
    
    // Update Firestore
    await admin.firestore().collection('users').doc(userId).update({
      disabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: `User ${disabled ? 'blocked' : 'unblocked'} successfully`,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
```

### Step 7: Update Context (Remove Warning)

Update `app/context.tsx` - remove the console.warn and update deleteUser success message:

```typescript
const deleteUser = async (userId: string) => {
  if (useFirebase) {
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      const allUsers = await getAllUsers();
      setUsers(allUsers as User[]);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      throw error;
    }
  } else {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }
};
```

### Step 8: Test

1. Restart dev server: `npm run dev`
2. Login as manager
3. Delete a user → Should delete from both Auth and Firestore
4. Try creating a user with the same email → Should work now!

## Benefits of Admin SDK

✅ Complete user deletion (Auth + Firestore)
✅ No "email already registered" errors
✅ Proper user blocking/unblocking
✅ Server-side security (credentials never exposed to client)
✅ More powerful user management features
✅ Better error handling

## Security Notes

⚠️ **NEVER commit service account credentials to Git**
⚠️ Add `.env.local` to `.gitignore`
⚠️ Use environment variables in production (Vercel, Railway, etc.)
⚠️ Restrict API routes to authenticated managers only (add middleware)
