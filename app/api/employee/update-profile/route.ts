import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { employeeId, updates } = await request.json();

    if (!employeeId || !updates) {
      return NextResponse.json(
        { error: 'Employee ID and updates are required' },
        { status: 400 }
      );
    }

    // Update employee in Firestore using Admin SDK
    await adminDb.collection('users').doc(employeeId).update(updates);

    return NextResponse.json({
      success: true,
      message: 'Employee profile updated successfully',
    });
  } catch (error: any) {
    console.error('Employee update error:', error);
    return NextResponse.json(
      { error: 'Update failed', message: error.message },
      { status: 500 }
    );
  }
}
