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
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Build update mask
    const updateMask = Object.keys(updates).map(key => `updateMask.fieldPaths=${key}`).join('&');
    
    // Convert updates to Firestore field format
    const fields: any = {};
    Object.keys(updates).forEach(key => {
      const value = updates[key];
      if (typeof value === 'string') {
        fields[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        fields[key] = { integerValue: value.toString() };
      } else if (typeof value === 'boolean') {
        fields[key] = { booleanValue: value };
      }
    });

    // Update policy in Firestore using REST API with API key
    const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/policies/${policyId}?${updateMask}&key=${apiKey}`;
    
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
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
