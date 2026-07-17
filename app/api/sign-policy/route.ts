import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { policyId, employeeId, signatureData } = await request.json();

    if (!policyId || !employeeId || !signatureData) {
      return NextResponse.json(
        { error: 'Policy ID, employee ID, and signature data are required' },
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

    // Check if signature already exists using REST API query
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    
    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'signatures' }],
          where: {
            compositeFilter: {
              op: 'AND',
              filters: [
                {
                  fieldFilter: {
                    field: { fieldPath: 'policyId' },
                    op: 'EQUAL',
                    value: { stringValue: policyId }
                  }
                },
                {
                  fieldFilter: {
                    field: { fieldPath: 'employeeId' },
                    op: 'EQUAL',
                    value: { stringValue: employeeId }
                  }
                }
              ]
            }
          }
        }
      })
    });

    if (queryResponse.ok) {
      const results = await queryResponse.json();
      if (results && results.length > 0 && results[0].document) {
        return NextResponse.json(
          { error: 'Policy already signed' },
          { status: 400 }
        );
      }
    }

    // Create signature using REST API
    const createUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/signatures`;
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          policyId: { stringValue: policyId },
          employeeId: { stringValue: employeeId },
          signatureData: { stringValue: signatureData },
          signedAt: { timestampValue: new Date().toISOString() }
        }
      })
    });

    if (!createResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to create signature' },
        { status: 500 }
      );
    }

    const createdDoc = await createResponse.json();
    const docId = createdDoc.name.split('/').pop();

    const signature = {
      id: docId,
      policyId: createdDoc.fields.policyId.stringValue,
      employeeId: createdDoc.fields.employeeId.stringValue,
      signatureData: createdDoc.fields.signatureData.stringValue,
      signedAt: createdDoc.fields.signedAt.timestampValue,
    };

    return NextResponse.json({
      success: true,
      signature,
    });
  } catch (error: any) {
    console.error('Error signing policy:', error);
    return NextResponse.json(
      { error: 'Failed to sign policy', message: error.message },
      { status: 500 }
    );
  }
}
