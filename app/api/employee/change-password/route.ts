import { NextRequest, NextResponse } from 'next/server';

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

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      console.error('Firebase config missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // First, verify current password by fetching the employee
    const getUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${employeeId}`;
    
    const getResponse = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!getResponse.ok) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const employeeDoc = await getResponse.json();
    const storedPassword = employeeDoc.fields?.password?.stringValue;

    if (storedPassword !== currentPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password in Firestore using REST API
    const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${employeeId}?updateMask.fieldPaths=password`;
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          password: { stringValue: newPassword }
        }
      })
    });

    if (!updateResponse.ok) {
      console.error('Firestore update failed:', updateResponse.status);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

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
