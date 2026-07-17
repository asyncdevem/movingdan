import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { employeeId, currentPassword, newPassword } = await request.json();

    if (!employeeId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Employee ID, current password, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      console.error('Firebase Admin not initialized');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // First, verify current password by fetching the employee
    const employeeDoc = await adminDb.collection('users').doc(employeeId).get();

    if (!employeeDoc.exists) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const employeeData = employeeDoc.data();
    const storedPassword = employeeData?.password;

    if (storedPassword !== currentPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password in Firestore using Admin SDK
    await adminDb.collection('users').doc(employeeId).update({
      password: newPassword
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Password change failed', message: error.message },
      { status: 500 }
    );
  }
}
