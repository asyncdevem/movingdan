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
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Delete warning from Firestore using REST API
    const deleteUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/warnings/${warningId}`;
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE'
    });

    if (!response.ok) {
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
