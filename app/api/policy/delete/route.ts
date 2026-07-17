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
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Delete policy from Firestore using REST API with API key
    const deleteUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/policies/${policyId}?key=${apiKey}`;
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE'
    });

    if (!response.ok) {
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
