import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    // Check if Firebase Admin is initialized
    if (!adminDb) {
      console.error('[Session API] Firebase Admin not initialized');
      return NextResponse.json({ session: null }, { status: 200 });
    }

    // Get full user profile from Firestore using Admin SDK
    const userDoc = await adminDb.collection('users').doc(session.userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    const userData = userDoc.data();

    return NextResponse.json({
      session: {
        user: {
          id: session.userId,
          ...userData,
        },
        role: session.role,
      },
    });
  } catch (error) {
    console.error('[Session API] Error:', error);
    return NextResponse.json({ 
      session: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
}
