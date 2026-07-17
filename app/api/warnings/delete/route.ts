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
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Delete warning from Firestore using REST API with API key
    const deleteUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/warnings/${warningId}?key=${apiKey}`;
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to delete warning', details: errorText },
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
