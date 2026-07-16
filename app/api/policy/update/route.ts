import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { policyId, updates } = await request.json();

    if (!policyId || !updates) {
      return NextResponse.json(
        { error: 'Policy ID and updates are required' },
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

    // Update policy in Firestore using REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/policies/${policyId}?updateMask.fieldPaths=${Object.keys(updates).join('&updateMask.fieldPaths=')}`;
    
    // Convert updates to Firestore format
    const fields: Record<string, any> = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === 'string') {
        fields[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        fields[key] = { doubleValue: value };
      }
    });

    const updateResponse = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields })
    });

    if (!updateResponse.ok) {
      console.error('Firestore update failed:', updateResponse.status);
      return NextResponse.json(
        { error: 'Failed to update policy' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Policy updated successfully',
    });
  } catch (error: any) {
    console.error('Policy update error:', error);
    return NextResponse.json(
      { error: 'Update failed', message: error.message },
      { status: 500 }
    );
  }
}
