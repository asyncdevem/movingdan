import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/gmail';

// Generate a random password
function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Find user by email
    const usersUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?key=${apiKey}`;
    const usersResponse = await fetch(usersUrl);

    if (!usersResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    const usersData = await usersResponse.json();
    let userDoc = null;
    let userId = null;

    if (usersData.documents) {
      for (const doc of usersData.documents) {
        const userEmail = doc.fields?.email?.stringValue;
        if (userEmail?.toLowerCase() === email.toLowerCase()) {
          userDoc = doc;
          userId = doc.name.split('/').pop();
          break;
        }
      }
    }

    if (!userDoc) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    const userName = userDoc.fields?.name?.stringValue || 'Employee';
    const userRole = userDoc.fields?.role?.stringValue;

    // Only allow password reset for employees
    if (userRole !== 'employee') {
      return NextResponse.json(
        { error: 'Password reset is only available for employee accounts' },
        { status: 403 }
      );
    }

    // Generate new password
    const newPassword = generatePassword();

    // Update user password in Firestore
    const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=password&key=${apiKey}`;
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          password: { stringValue: newPassword },
        }
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('Firestore update error:', errorData);
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    // Send password reset email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/employee-login`;

    try {
      await sendPasswordResetEmail(email, userName, newPassword, loginUrl);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Password was reset but email failed
      return NextResponse.json(
        { 
          success: true, 
          warning: 'Password was reset but email could not be sent. Please contact your manager.' 
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Check your email for the new password.'
    });
  } catch (error: any) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset', message: error.message },
      { status: 500 }
    );
  }
}
