// Shared employee authentication logic
export async function validateEmployeeCredentials(phone: string, password: string) {
  if (!phone || !password) {
    return { success: false, error: 'Phone and password are required' };
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.error('Firebase config missing');
    return { success: false, error: 'Server configuration error' };
  }

  // Normalize phone number
  const normalizedPhone = phone.replace(/\D/g, '');

  try {
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
      return { success: false, error: 'Database query failed' };
    }

    const results = await queryResponse.json();

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
      return { success: false, error: 'Invalid phone number or password' };
    }

    return { success: true, employee: matchingEmployee };
  } catch (error: any) {
    console.error('Employee validation error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}
