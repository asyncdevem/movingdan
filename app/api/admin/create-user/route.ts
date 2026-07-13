import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, title } = await request.json();

    // Validate input
    if (!email || !password || !name || !role || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create user via Firebase REST API
    // This doesn't require admin SDK and won't log out the current user
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || 'Failed to create user';
      console.error('Firebase auth error:', errorMessage);
      
      // Map Firebase error codes to user-friendly messages
      let userMessage = errorMessage;
      if (errorMessage.includes('EMAIL_EXISTS')) {
        userMessage = 'This email is already registered';
      } else if (errorMessage.includes('WEAK_PASSWORD')) {
        userMessage = 'Password is too weak';
      } else if (errorMessage.includes('INVALID_EMAIL')) {
        userMessage = 'Invalid email format';
      }
      
      return NextResponse.json(
        { error: userMessage },
        { status: response.status }
      );
    }

    console.log('User created successfully:', data.localId);

    return NextResponse.json({
      success: true,
      userId: data.localId,
      email: data.email,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
