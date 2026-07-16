import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { warningId } = await request.json();

    if (!warningId) {
      return NextResponse.json(
        { error: 'Warning ID is required' },
        { status: 400 }
      );
    }

    // Delete warning from Firestore using Admin SDK
    await adminDb.collection('warnings').doc(warningId).delete();

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
