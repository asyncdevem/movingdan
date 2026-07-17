import { NextRequest, NextResponse } from 'next/server';
import { validateEmployeeCredentials } from '@/lib/employee-auth';

// Simple API route without Firebase Admin - query Firestore via REST API
export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    const result = await validateEmployeeCredentials(phone, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Invalid phone number or password' ? 401 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      employee: result.employee,
    });
  } catch (error: any) {
    console.error('Employee login error:', error);
    return NextResponse.json(
      { error: 'Login failed', message: error.message },
      { status: 500 }
    );
  }
}
