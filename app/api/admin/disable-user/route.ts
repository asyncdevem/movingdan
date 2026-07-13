import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, disabled } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In production, use Firebase Admin SDK:
    // await admin.auth().updateUser(userId, { disabled });

    return NextResponse.json({
      success: true,
      message: `User ${disabled ? 'disabled' : 'enabled'} successfully`,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
