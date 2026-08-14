import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/gmail';

export async function POST(request: NextRequest) {
  try {
    const { to, employeeName, password } = await request.json();

    if (!to || !employeeName || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: to, employeeName, password' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/employee-login`;

    await sendWelcomeEmail(to, employeeName, password, loginUrl);

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully' 
    });
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', message: error.message },
      { status: 500 }
    );
  }
}
