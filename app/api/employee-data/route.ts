import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Load policies, signatures, and warnings for employee
    const [policiesSnapshot, signaturesSnapshot, warningsSnapshot] = await Promise.all([
      adminDb.collection('policies').get(),
      adminDb.collection('signatures')
        .where('employeeId', '==', employeeId)
        .get(),
      adminDb.collection('warnings')
        .where('employeeId', '==', employeeId)
        .get(),
    ]);

    const policies = policiesSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const signatures = signaturesSnapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        policyId: data.policyId,
        employeeId: data.employeeId,
        signatureData: data.signatureData,
        signedAt: data.signedAt?.toDate ? data.signedAt.toDate().toISOString() : new Date().toISOString(),
      };
    });

    const warnings = warningsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
