import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { warningId, updates } = await request.json();

    if (!warningId || !updates) {
      return NextResponse.json(
        { error: 'Warning ID and updates are required' },
        { status: 400 }
      );
    }

    // Update warning in Firestore using Admin SDK
    await adminDb.collection('warnings').doc(warningId).update(updates);

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
