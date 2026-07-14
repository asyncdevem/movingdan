import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch data using Firestore REST API
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    
    const [policiesRes, signaturesRes, warningsRes] = await Promise.all([
      fetch(`${baseUrl}:runQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'policies' }]
          }
        })
      }),
      fetch(`${baseUrl}:runQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'signatures' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'employeeId' },
                op: 'EQUAL',
                value: { stringValue: employeeId }
              }
            }
          }
        })
      }),
      fetch(`${baseUrl}:runQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'warnings' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'employeeId' },
                op: 'EQUAL',
                value: { stringValue: employeeId }
              }
            }
          }
        })
      }),
    ]);

    const parseDocs = (results: any[]) => {
      return results
        .filter(r => r.document)
        .map(r => {
          const fields = r.document.fields;
          const docId = r.document.name.split('/').pop();
          const data: any = { id: docId };
          
          for (const [key, value] of Object.entries(fields)) {
            const field = value as any;
            if (field.stringValue !== undefined) data[key] = field.stringValue;
            else if (field.integerValue !== undefined) data[key] = parseInt(field.integerValue);
            else if (field.doubleValue !== undefined) data[key] = field.doubleValue;
            else if (field.booleanValue !== undefined) data[key] = field.booleanValue;
            else if (field.timestampValue !== undefined) data[key] = field.timestampValue;
            else if (field.arrayValue !== undefined) {
              data[key] = field.arrayValue.values?.map((v: any) => v.stringValue || v) || [];
            }
          }
          
          return data;
        });
    };

    const policies = parseDocs(await policiesRes.json());
    const signatures = parseDocs(await signaturesRes.json());
    const warnings = parseDocs(await warningsRes.json());

    return NextResponse.json({
      success: true,
      policies,
      signatures,
      warnings,
    });
  } catch (error: any) {
    console.error('Error loading employee data:', error);
    return NextResponse.json(
      { error: 'Failed to load employee data', message: error.message },
      { status: 500 }
    );
  }
}
