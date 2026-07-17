import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      console.error('[Session API] Firebase project ID missing');
      return NextResponse.json({ session: null }, { status: 200 });
    }

    // Get full user profile from Firestore using REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${session.userId}`;
    
    const response = await fetch(firestoreUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Session API] Failed to fetch user:', response.status);
      return NextResponse.json({ session: null }, { status: 200 });
    }

    const userDoc = await response.json();

    if (!userDoc.fields) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    // Convert Firestore fields to regular object
    const userData: any = {
      id: session.userId,
      role: session.role,
    };

    // Map Firestore field values
    Object.keys(userDoc.fields).forEach((key) => {
      const field = userDoc.fields[key];
      if (field.stringValue !== undefined) {
        userData[key] = field.stringValue;
      } else if (field.integerValue !== undefined) {
        userData[key] = parseInt(field.integerValue);
      } else if (field.booleanValue !== undefined) {
        userData[key] = field.booleanValue;
      }
    });

    return NextResponse.json({
      session: {
        user: userData,
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
