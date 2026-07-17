import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { warningId, employeeSignature } = await request.json();

    if (!warningId || !employeeSignature) {
      return NextResponse.json(
        { error: 'Warning ID and signature are required' },
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

    // Update warning with employee signature using Firestore REST API
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/warnings/${warningId}?updateMask.fieldPaths=employeeSignature&key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          employeeSignature: { stringValue: employeeSignature }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Firestore error:', errorData);
      return NextResponse.json(
        { error: 'Failed to sign warning' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error signing warning:', error);
    return NextResponse.json(
      { error: 'Failed to sign warning', message: error.message },
      { status: 500 }
    );
  }
}
