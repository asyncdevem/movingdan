import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  const health: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    firebase: {
      adminDb: !!adminDb,
      adminAuth: !!adminAuth,
      hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'NOT_SET',
    },
  };

  // Try to query Firestore
  try {
    if (adminDb) {
      const testQuery = await adminDb.collection('users').limit(1).get();
      health.firebase.firestoreWorks = true;
      health.firebase.canQueryUsers = true;
      health.firebase.userCount = testQuery.size;
    }
  } catch (error: any) {
    health.firebase.firestoreWorks = false;
    health.firebase.error = error.message;
  }

  return NextResponse.json(health);
}
