import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { policyId, updates } = await request.json();

    if (!policyId || !updates) {
      return NextResponse.json(
        { error: 'Policy ID and updates are required' },
        { status: 400 }
      );
    }

    // Update policy in Firestore using Admin SDK
    await adminDb.collection('policies').doc(policyId).update(updates);

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
