# 📱 Phone Authentication Setup Guide

## Why You're Seeing the Error

The error **"Firebase: Error (auth/invalid-app-credential)"** means phone authentication needs additional Firebase configuration that's not yet complete.

## Quick Solution: Use Email Instead

**Click the "EMAIL" button** in the auth screen - email authentication works immediately and doesn't require additional setup.

---

## To Enable Phone Authentication (Optional)

If you want phone auth to work, follow these steps:

### Step 1: Enable Phone Auth in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/dan-the-moving-man-61555/authentication/providers)
2. Click **Authentication** → **Sign-in method**
3. Enable **Phone** provider
4. Click **Save**

### Step 2: Add Your Domain to Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `localhost` (for development)
   - Your production domain when deploying

### Step 3: Configure reCAPTCHA (Required for Phone Auth)

Phone authentication uses reCAPTCHA to prevent abuse. Two options:

#### Option A: Use Firebase's Default reCAPTCHA (Easiest)
Firebase automatically handles reCAPTCHA. Just ensure:
- Your domain is in the authorized domains list
- You're accessing the app via the correct URL (http://localhost:3000)

#### Option B: Use Your Own reCAPTCHA Site Key (Production)
1. Get reCAPTCHA keys from [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Choose **reCAPTCHA v3** or **reCAPTCHA v2 invisible**
3. Add your site key to Firebase:
   - Go to Firebase Console → **Authentication** → **Settings** → **Phone authentication**
   - Add your reCAPTCHA site key

### Step 4: Update Firebase Security Rules

Ensure your Firestore rules allow phone auth users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

---

## Testing Phone Authentication

### Test Phone Numbers (Development)

Firebase allows you to configure test phone numbers that bypass SMS:

1. Go to Firebase Console → **Authentication** → **Sign-in method** → **Phone**
2. Scroll to **Phone numbers for testing**
3. Add test numbers:
   - Phone: `+1 555-123-4567` → Code: `123456`
   - Phone: `+92 311-6435476` → Code: `123456`

These numbers will work without sending actual SMS.

### Production Phone Numbers

For real phone numbers:
- SMS will be sent via Firebase
- Costs apply (check Firebase pricing)
- Users receive a real verification code

---

## Common Issues & Solutions

### Issue: "auth/invalid-app-credential"
**Solution:** 
- Ensure phone auth is enabled in Firebase Console
- Verify your domain is in authorized domains
- Use **Email authentication** as an alternative

### Issue: "auth/captcha-check-failed"
**Solution:**
- Make sure you're accessing from an authorized domain
- Clear browser cache and try again
- Verify reCAPTCHA is properly configured

### Issue: Phone auth works locally but not in production
**Solution:**
- Add your production domain to Firebase authorized domains
- Update reCAPTCHA settings for production domain

---

## Recommended Approach

**For Now:** Use **Email/Password authentication** - it works immediately without additional setup.

**For Production:** 
1. Enable phone authentication in Firebase Console
2. Configure test phone numbers for development
3. Set up proper domains and reCAPTCHA
4. Test thoroughly before launching

---

## Current Status

✅ **Email Authentication** - Fully configured and ready
❌ **Phone Authentication** - Requires additional Firebase setup (optional)

**Your app will work perfectly with email authentication.** Phone auth is an optional enhancement.
