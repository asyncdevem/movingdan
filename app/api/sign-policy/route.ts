import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { policyId, employeeId, signatureData } = await request.json();

    if (!policyId || !employeeId || !signatureData) {
      return NextResponse.json(
        { error: 'Policy ID, employee ID, and signature data are required' },
        { status: 400 }
      );
    }

    // Check if signature already exists
    const existingSignatures = await adminDb
      .collection('signatures')
      .where('policyId', '==', policyId)
      .where('employeeId', '==', employeeId)
      .get();

    if (!existingSignatures.empty) {
      return NextResponse.json(
        { error: 'Policy already signed' },
        { status: 400 }
      );
    }

    // Create signature
    const signatureRef = await adminDb.collection('signatures').add({
      policyId,
      employeeId,
      signatureData,
      signedAt: FieldValue.serverTimestamp(),
    });

    // Get the created signature with converted timestamp
    const signatureDoc = await signatureRef.get();
    const data = signatureDoc.data();
    
    const signature = {
      id: signatureDoc.id,
      policyId: data?.policyId,
      employeeId: data?.employeeId,
      signatureData: data?.signatureData,
      signedAt: data?.signedAt?.toDate ? data.signedAt.toDate().toISOString() : new Date().toISOString(),
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
