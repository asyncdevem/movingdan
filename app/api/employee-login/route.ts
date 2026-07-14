import { NextRequest, NextResponse } from 'next/server';

// Simple API route without Firebase Admin - query Firestore via REST API
export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone and password are required' },
        { status: 400 }
      );
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!projectId || !apiKey) {
      console.error('Firebase config missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, '');
    
    console.log('Employee login attempt:', {
      inputPhone: phone,
      normalizedPhone,
    });

    // Query Firestore using REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    
    const queryResponse = await fetch(firestoreUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'role' },
              op: 'EQUAL',
              value: { stringValue: 'employee' }
            }
          }
        }
      })
    });

    if (!queryResponse.ok) {
      console.error('Firestore query failed:', queryResponse.status);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    }

    const results = await queryResponse.json();
    console.log('Query returned:', results.length || 0, 'employees');

    // Find matching employee
    let matchingEmployee: any = null;
    
    if (results && Array.isArray(results)) {
      for (const result of results) {
        if (result.document && result.document.fields) {
          const fields = result.document.fields;
          const userPhone = (fields.phone?.stringValue || '').replace(/\D/g, '');
          const userPassword = fields.password?.stringValue;
          
          if (userPhone === normalizedPhone && userPassword === password) {
            // Extract document ID from name
            const docPath = result.document.name;
            const docId = docPath.split('/').pop();
            
            matchingEmployee = {
              id: docId,
              name: fields.name?.stringValue || '',
              email: fields.email?.stringValue || '',
              phone: fields.phone?.stringValue || '',
              role: fields.role?.stringValue || 'employee',
              title: fields.title?.stringValue || '',
              avatar: fields.avatar?.stringValue || '',
            };
            break;
          }
        }
      }
    }

    if (!matchingEmployee) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      employee: matchingEmployee,
    });
  } catch (error: any) {
    console.error('Employee login error:', error);
    return NextResponse.json(
      { error: 'Login failed', message: error.message },
      { status: 500 }
    );
  }
}
