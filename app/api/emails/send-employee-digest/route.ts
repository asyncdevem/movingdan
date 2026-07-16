import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { employeeId, employeeName, employeeEmail } = await request.json();

    if (!employeeId || !employeeName || !employeeEmail) {
      return NextResponse.json(
        { error: 'Employee ID, name, and email are required' },
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

    // Fetch employee warnings
    const warningsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const warningsResponse = await fetch(warningsUrl, {
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
    });

    const warningsData = await warningsResponse.json();
    const warnings = warningsData?.map((item: any) => {
      const fields = item.document?.fields || {};
      return {
        type: fields.warningType?.stringValue || '',
        cost: fields.cost?.doubleValue || 0,
        date: fields.date?.stringValue || '',
        status: fields.status?.stringValue || 'Active',
        severity: fields.severity?.stringValue || 'Written'
      };
    }) || [];

    // Fetch unsigned policies
    const policiesUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/policies`;
    const policiesResponse = await fetch(policiesUrl);
    const policiesData = await policiesResponse.json();
    const allPolicies = policiesData.documents?.length || 0;

    const signaturesUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const signaturesResponse = await fetch(signaturesUrl, {
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
    });

    const signaturesData = await signaturesResponse.json();
    const signedPolicies = signaturesData?.length || 0;
    const unsignedPolicies = allPolicies - signedPolicies;

    // Calculate stats
    const totalWarnings = warnings.length;
    const activeWarnings = warnings.filter((w: any) => w.status === 'Active').length;
    const totalPenalties = warnings.reduce((sum: number, w: any) => sum + w.cost, 0);
    const recentWarnings = warnings
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #c5221f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .stat-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #c5221f; border-radius: 4px; }
    .warning-item { background: white; padding: 12px; margin: 8px 0; border-radius: 4px; border: 1px solid #ddd; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .badge-active { background: #fee; color: #c00; }
    .badge-resolved { background: #efe; color: #060; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Weekly Performance Digest</h1>
      <p style="margin: 5px 0 0 0;">DAN - The Moving Man</p>
    </div>
    
    <div class="content">
      <h2>Hello ${employeeName},</h2>
      <p>Here's your weekly performance summary:</p>
      
      <div class="stat-box">
        <h3 style="margin-top: 0;">⚠️ Warnings Summary</h3>
        <p><strong>Total Warnings:</strong> ${totalWarnings}</p>
        <p><strong>Active Warnings:</strong> ${activeWarnings}</p>
        <p><strong>Total Penalties:</strong> $${totalPenalties.toFixed(2)}</p>
      </div>

      ${recentWarnings.length > 0 ? `
      <div class="stat-box">
        <h3 style="margin-top: 0;">📋 Recent Warnings</h3>
        ${recentWarnings.map((w: any) => `
          <div class="warning-item">
            <strong>${w.type}</strong> 
            <span class="badge ${w.status === 'Active' ? 'badge-active' : 'badge-resolved'}">${w.status}</span>
            <br/>
            <small>Date: ${w.date} | Cost: $${w.cost.toFixed(2)}</small>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="stat-box">
        <h3 style="margin-top: 0;">📄 Policy Compliance</h3>
        <p><strong>Signed Policies:</strong> ${signedPolicies} of ${allPolicies}</p>
        ${unsignedPolicies > 0 ? `<p style="color: #c5221f;"><strong>⚠️ Unsigned Policies:</strong> ${unsignedPolicies}</p>` : '<p style="color: green;">✅ All policies signed!</p>'}
      </div>

      <p style="margin-top: 20px;">Keep up the good work and stay compliant with company policies!</p>
    </div>
    
    <div class="footer">
      <p>This is an automated weekly digest from DAN - The Moving Man</p>
      <p>If you have questions, please contact your manager.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: [employeeEmail],
      subject: `Weekly Performance Digest - ${new Date().toLocaleDateString()}`,
      html: emailHtml,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to send email', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Employee digest sent successfully',
      emailId: data?.id,
    });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', message: error.message },
      { status: 500 }
    );
  }
}
