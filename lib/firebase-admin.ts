import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | null = null;
let adminAuth: any = null;
let adminDb: any = null;

// Initialize Firebase Admin SDK
try {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase Admin environment variables:', {
        hasProjectId: !!projectId,
        hasClientEmail: !!clientEmail,
        hasPrivateKey: !!privateKey,
      });
      throw new Error('Firebase Admin credentials not configured');
    }

    // Clean and format the private key properly
    // Remove any quotes and ensure proper line breaks
    let formattedKey = privateKey
      .replace(/\\n/g, '\n')  // Replace literal \n with actual newlines
      .replace(/^["']|["']$/g, ''); // Remove surrounding quotes if any

    // Ensure it has proper BEGIN/END markers
    if (!formattedKey.includes('BEGIN PRIVATE KEY')) {
      console.error('Private key does not contain BEGIN PRIVATE KEY marker');
      throw new Error('Invalid private key format');
    }

    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedKey,
      }),
    });
    
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
    
    console.log('Firebase Admin initialized successfully');
  } else {
    app = getApps()[0];
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  // Don't throw - let API routes handle the error
}

export { adminAuth, adminDb };
export default admin;
