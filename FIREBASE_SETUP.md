# 🔥 Firebase Setup Guide - DAN The Moving Man

This guide will help you integrate Firebase Authentication and Cloud Functions for the weekly email notification system.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- A Google account for Firebase Console

---

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add Project"**
3. Enter project name: **"movingdan"** (or your preferred name)
4. Enable Google Analytics (optional)
5. Click **"Create Project"**

---

## 🔐 Step 2: Enable Authentication Methods

### Email/Password Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Toggle **Enable**
4. Click **Save**

### Phone Authentication

1. In the same **Sign-in method** tab, click **Phone**
2. Toggle **Enable**
3. Add your test phone numbers (for development):
   - Click **"Phone numbers for testing"**
   - Add: `+1 555-123-4567` → Code: `123456`
4. Click **Save**

**Important**: For production, configure reCAPTCHA and add your domain to authorized domains.

---

## 🗄️ Step 3: Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **"Create database"**
3. Select **"Start in production mode"** (or test mode for development)
4. Choose your region (e.g., `us-central1`)
5. Click **"Enable"**

### Create Collections

Create these collections (they'll be auto-created by the app, but you can set them up manually):

```
/users
  - {userId}
    - name: string
    - email: string
    - phone: string (optional)
    - role: "employee" | "manager"
    - title: string
    - avatar: string
    - emailNotificationsEnabled: boolean
    - weeklyDigestEnabled: boolean
    - instantWarningAlerts: boolean
    - createdAt: timestamp

/policies
  - {policyId}
    - title: string
    - shortDesc: string
    - iconName: string
    - content: string

/signatures
  - {signatureId}
    - policyId: string
    - employeeId: string
    - signedAt: timestamp
    - signatureData: string

/warnings
  - {warningId}
    - employeeId: string
    - employeeName: string
    - date: string
    - warningType: string
    - cost: number
    - incidentDetails: string
    - severity: string
    - status: "Active" | "Resolved"
    - issuedBy: string
    - managerSignature: string

/emailQueue
  - {queueId}
    - type: "weekly_digest" | "warning_issued" | "policy_added"
    - userId: string
    - data: object
    - status: "pending" | "processing" | "sent" | "failed"
    - priority: "normal" | "high"
    - createdAt: timestamp
```

---

## 🔑 Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to **"Your apps"**
3. Click the **Web icon** `</>`
4. Register your app: **"movingdan-web"**
5. Copy the `firebaseConfig` object

---

## 📝 Step 5: Configure Environment Variables

Edit `.env.local` in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin SDK (for backend)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Email Configuration (Choose one)
# Option 1: Gmail SMTP
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Option 2: SendGrid
EMAIL_SERVICE_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx

# Option 3: AWS SES
EMAIL_SERVICE_API_KEY=your-aws-ses-key

# Email Settings
EMAIL_FROM_ADDRESS=noreply@movingdan.com
EMAIL_FROM_NAME=DAN - The Moving Man
```

### Get Firebase Admin SDK Credentials

1. Go to **Project Settings** → **Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Extract these values:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

**⚠️ Security Warning**: Never commit `.env.local` to Git. It's already in `.gitignore`.

---

## 📧 Step 6: Configure Email Service

### Option A: Gmail SMTP (Easiest for testing)

1. Go to your Google Account settings
2. Enable **2-Factor Authentication**
3. Generate an **App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select **"Mail"** and **"Other"**
   - Name it: **"MovingDan App"**
   - Copy the 16-character password
4. Use this in `EMAIL_PASSWORD`

### Option B: SendGrid (Recommended for production)

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Verify your sender email
4. Add API key to `EMAIL_SERVICE_API_KEY`

### Option C: AWS SES (Enterprise solution)

1. Set up AWS SES in your AWS account
2. Verify your domain
3. Create IAM user with SES permissions
4. Use credentials in environment variables

---

## ☁️ Step 7: Deploy Cloud Functions

### Initialize Firebase CLI

```bash
cd functions
firebase login
firebase init functions
```

Select:
- **TypeScript**
- **ESLint** (yes)
- **Install dependencies** (yes)

### Deploy Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

This deploys:
- `processEmailQueue` - Triggers when new email is added to queue
- `scheduleWeeklyDigests` - Runs every Friday at 5 PM

---

## 🔧 Step 8: Configure Firestore Security Rules

Go to **Firestore Database** → **Rules** and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Policies collection (read-only for employees, write for managers)
    match /policies/{policyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager';
    }
    
    // Signatures collection
    match /signatures/{signatureId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Warnings collection
    match /warnings/{warningId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager';
    }
    
    // Email queue (internal only)
    match /emailQueue/{queueId} {
      allow read, write: if false; // Only Cloud Functions can access
    }
  }
}
```

Click **"Publish"**

---

## 🧪 Step 9: Test the Integration

### Test Authentication

1. Run the app: `npm run dev`
2. You should see the Firebase Auth screen
3. Try signing up with email and phone

### Test Email Notifications

1. Go to **Settings** → **Email Notifications** tab
2. Click **"Send Test Weekly Digest"**
3. Check the Firestore `emailQueue` collection
4. Check your email inbox

### Monitor Cloud Functions

```bash
firebase functions:log
```

Or view logs in Firebase Console → **Functions** → **Logs**

---

## 📅 Weekly Digest Schedule

The Cloud Function `scheduleWeeklyDigests` runs automatically:

- **Time**: Every Friday at 5:00 PM EST
- **Action**: Generates digest for all employees
- **Includes**:
  - Warnings issued that week
  - Policies signed that week
  - Compliance summary

To test manually:

```bash
firebase functions:shell
scheduleWeeklyDigests()
```

---

## 🐛 Troubleshooting

### Authentication Issues

**Error**: "Firebase not configured"
- ✅ Check `.env.local` has correct values
- ✅ Restart Next.js dev server after changing `.env.local`

**Error**: "reCAPTCHA validation failed"
- ✅ Add your domain to Firebase **Authorized domains**
- ✅ For localhost, use test phone numbers

### Email Not Sending

**Check**:
1. ✅ Cloud Function is deployed: `firebase functions:list`
2. ✅ Email queue document exists in Firestore
3. ✅ Function logs: `firebase functions:log`
4. ✅ Email service credentials are correct
5. ✅ Check spam folder

### Firestore Permission Denied

- ✅ Update security rules (Step 8)
- ✅ User is authenticated
- ✅ User has correct role in `/users/{userId}`

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Enable **App Check** for security
- [ ] Configure **custom domain** for emails
- [ ] Set up **email monitoring** (bounce tracking)
- [ ] Enable **Firebase Analytics**
- [ ] Review Firestore security rules
- [ ] Set **billing alerts** in Firebase
- [ ] Configure **backup** for Firestore
- [ ] Add **error monitoring** (Sentry)
- [ ] Test on multiple devices
- [ ] Add **rate limiting** to auth endpoints

---

## 💰 Firebase Pricing

### Free Tier (Spark Plan)

- **Authentication**: 10K verifications/month
- **Firestore**: 1 GB storage, 50K reads/day
- **Cloud Functions**: 125K invocations/month
- **Perfect for**: Testing and small deployments

### Paid Tier (Blaze Plan)

- **Pay as you go**
- Required for Cloud Functions with external API calls
- Estimate: ~$5-20/month for small business

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)

---

## 🆘 Need Help?

1. Check Firebase Console logs
2. Review the code in `/lib/firebase.ts`
3. Test with Firebase Local Emulator Suite
4. Contact: dan@movingdan.com

---

**Status**: ✅ Demo Mode (placeholder functionality)  
**When Configured**: 🔥 Full Firebase integration with real-time authentication and automated emails

