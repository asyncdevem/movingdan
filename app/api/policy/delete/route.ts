import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { policyId } = await request.json();

    if (!policyId) {
      return NextResponse.json(
        { error: 'Policy ID is required' },
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

    // Delete policy from Firestore using REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/policies/${policyId}`;
    
    const deleteResponse = await fetch(firestoreUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!deleteResponse.ok) {
      console.error('Firestore delete failed:', deleteResponse.status);
      return NextResponse.json(
        { error: 'Failed to delete policy' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Policy deleted successfully',
    });
  } catch (error: any) {
    console.error('Policy delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed', message: error.message },
      { status: 500 }
    );
  }
}
