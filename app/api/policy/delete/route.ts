import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { policyId } = await request.json();

    if (!policyId) {
      return NextResponse.json(
        { error: 'Policy ID is required' },
        { status: 400 }
      );
    }

    // Delete policy from Firestore using Admin SDK
    await adminDb.collection('policies').doc(policyId).delete();

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
