# DAN - The Moving Man 🚚

A comprehensive workforce management and compliance application for moving companies, built with Next.js, Firebase, and TypeScript.

## 🎯 Features

### Core Functionality
- ✅ **Digital Policy Management** - Create, distribute, and track policy acknowledgments
- ✅ **E-Signature System** - Canvas-based digital signatures for policies
- ✅ **Performance Tracking** - Track warnings, incidents, and compliance records
- ✅ **Employee Directory** - Manage crew members with compliance dashboards
- ✅ **Warning System** - Issue and track disciplinary actions with photo attachments
- ✅ **Reports Dashboard** - Analytics and compliance metrics

### 🔥 Firebase Integration
- ✅ **Authentication** - Email/Password and Phone number authentication
- ✅ **Firestore Database** - Real-time data sync and cloud storage
- ✅ **Cloud Functions** - Automated email processing and scheduling
- ✅ **Email Notifications** - Weekly digests and instant alerts

### 📧 Email Notification System
- ✅ **Weekly Digests** - Automated weekly compliance summaries (Every Friday 5 PM)
- ✅ **Warning Alerts** - Instant notifications when warnings are issued
- ✅ **Policy Notifications** - Alerts for new policies requiring signatures
- ✅ **Professional Templates** - Mobile-responsive HTML emails matching app theme

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account (for production features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/movingdan.git
cd movingdan

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Demo Mode

The app works in **demo mode** without Firebase configuration. All UI components are fully functional with localStorage persistence.

### Activate Firebase (Optional)

For real authentication and automated emails:

1. **Quick Setup** (5 minutes) - See `QUICK_START.md`
2. **Detailed Setup** - See `FIREBASE_SETUP.md`
3. **Architecture Overview** - See `EMAIL_SYSTEM_OVERVIEW.md`

```bash
# Create .env.local and add Firebase credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... (see .env.local template)

# Restart server
npm run dev
```

## 📁 Project Structure

```
movingdan/
├── app/
│   ├── components/          # React components
│   │   ├── AuthScreen.tsx
│   │   ├── FirebaseAuthScreen.tsx
│   │   ├── EmailNotificationSettings.tsx
│   │   ├── PolicyDetail.tsx
│   │   ├── WarningForm.tsx
│   │   └── ...
│   ├── context.tsx          # App state management
│   ├── page.tsx             # Main app shell
│   └── email-preview/       # Email template preview
├── lib/
│   ├── firebase.ts          # Firebase SDK configuration
│   ├── emailTemplates.ts    # HTML email templates
│   └── emailHelpers.ts      # Email utility functions
├── functions/               # Firebase Cloud Functions
│   └── src/
│       └── index.ts         # Email processing & scheduling
├── docs/
│   └── prd.md              # Product requirements
├── FIREBASE_SETUP.md       # Detailed Firebase guide
├── EMAIL_SYSTEM_OVERVIEW.md # Architecture documentation
└── QUICK_START.md          # Quick setup guide
```

## 🎨 Key Pages

### Main Application
- `/` - Home dashboard with policy access and warning system
- `/email-preview` - Live email template preview

### Settings
- Settings → General - User profile and role switching
- Settings → Email Notifications - Manage email preferences

## 🔐 Authentication

**Supported Methods:**
- Email/Password
- Phone number with SMS verification

**Roles:**
- **Employee** - View own warnings, sign policies, personal compliance
- **Manager** - Issue warnings, add policies, view all employees, analytics

## 📧 Email System

### Email Types

1. **Weekly Digest** (Automated)
   - Schedule: Every Friday at 5:00 PM EST
   - Contains: Warnings, signatures, compliance stats
   - Recipients: All employees with `weeklyDigestEnabled: true`

2. **Warning Issued** (Instant)
   - Trigger: Manager creates warning
   - Contains: Warning details, severity, cost
   - Recipient: Target employee

3. **New Policy** (Instant)
   - Trigger: Manager adds policy
   - Contains: Policy details, signature requirement
   - Recipients: All employees

### Email Services Supported
- Gmail SMTP (easy for testing)
- SendGrid (recommended for production)
- AWS SES (enterprise solution)

## 🧪 Testing

### Preview Email Templates
```bash
# Run app
npm run dev

# Open in browser
http://localhost:3000/email-preview
```

### Test Authentication
```bash
# Demo mode test credentials:
Email: any@example.com / password: any
Phone: +1 555-123-4567 / code: 123456
```

### Test Email Notifications
```bash
# After Firebase setup:
# 1. Go to Settings → Email Notifications
# 2. Enable toggles
# 3. Click "Send Test Weekly Digest"
# 4. Check Firestore console → emailQueue collection
# 5. Check email inbox
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Email**: Nodemailer
- **State**: React Context API

## 📊 Firebase Collections

```
/users - User profiles and preferences
/policies - Company policies
/signatures - Policy acknowledgments
/warnings - Disciplinary records
/emailQueue - Email processing queue
```

## 🔒 Security

- ✅ Environment variables never committed (`.env.local` in `.gitignore`)
- ✅ Firestore security rules for role-based access
- ✅ Firebase Admin SDK for secure backend operations
- ✅ Email queue isolated to Cloud Functions only

## 📈 Performance

**Firebase Free Tier:**
- 10K authentications/month
- 50K Firestore reads/day
- 125K function invocations/month
- Perfect for testing and small deployments

**Paid Tier (Blaze):**
- Required for Cloud Functions with external APIs
- Estimate: $5-20/month for small business

## 🐛 Troubleshooting

See `QUICK_START.md` and `FIREBASE_SETUP.md` for detailed troubleshooting guides.

**Common Issues:**
- "Firebase not configured" → Update `.env.local` and restart
- Emails not sending → Check Cloud Functions logs
- Auth errors → Verify Firebase Console settings

## 📚 Documentation

- `QUICK_START.md` - Get started in 5 minutes
- `FIREBASE_SETUP.md` - Complete Firebase setup guide
- `EMAIL_SYSTEM_OVERVIEW.md` - System architecture and design
- `docs/prd.md` - Product requirements document

## 🤝 Contributing

This is an internal company application. For questions or support, contact the development team.

## 📄 License

Private - Internal use only

---

**Built with ❤️ for DAN - The Moving Man team**  
**Powered by Next.js and Firebase**
