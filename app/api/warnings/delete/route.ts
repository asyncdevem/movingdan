import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { warningId } = await request.json();

    if (!warningId) {
      return NextResponse.json(
        { error: 'Warning ID is required' },
        { status: 400 }
      );
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      console.error('Firebase config missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Delete warning from Firestore using REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/warnings/${warningId}`;
    
    const deleteResponse = await fetch(firestoreUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!deleteResponse.ok) {
      console.error('Firestore delete failed:', deleteResponse.status);
      return NextResponse.json(
        { error: 'Failed to delete warning' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Warning deleted successfully',
    });
  } catch (error: any) {
    console.error('Warning delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed', message: error.message },
      { status: 500 }
    );
  }
}
