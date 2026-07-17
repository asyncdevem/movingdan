import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { warningId, updates } = await request.json();

    if (!warningId || !updates) {
      return NextResponse.json(
        { error: 'Warning ID and updates are required' },
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
      } else if (Array.isArray(value)) {
        fields[key] = {
          arrayValue: {
            values: value.map(v => ({ stringValue: v }))
          }
        };
      }
    });

    // Update warning in Firestore using REST API
    const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/warnings/${warningId}?${updateMask}`;
    
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update warning' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Warning updated successfully',
    });
  } catch (error: any) {
    console.error('Warning update error:', error);
    return NextResponse.json(
      { error: 'Update failed', message: error.message },
      { status: 500 }
    );
  }
}
