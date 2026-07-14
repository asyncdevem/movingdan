import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone and password are required' },
        { status: 400 }
      );
    }

    // Normalize phone number (remove all non-digit characters)
    const normalizedPhone = phone.replace(/\D/g, '');

    // Query Firestore for employee with matching phone
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef
      .where('role', '==', 'employee')
      .get();

    // Find matching employee
    let matchingEmployee: any = null;
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      const userPhone = (data.phone || '').replace(/\D/g, '');
      
      if (userPhone === normalizedPhone && data.password === password) {
        matchingEmployee = {
          id: doc.id,
          ...data,
        };
      }
    });

    if (!matchingEmployee) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...employeeData } = matchingEmployee;

    return NextResponse.json({
      success: true,
      employee: employeeData,
    });
  } catch (error: any) {
    console.error('Employee login error:', error);
    return NextResponse.json(
      { error: 'Login failed', message: error.message },
      { status: 500 }
    );
  }
}
