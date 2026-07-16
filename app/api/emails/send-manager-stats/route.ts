import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { managerName, managerEmail } = await request.json();

    if (!managerName || !managerEmail) {
      return NextResponse.json(
        { error: 'Manager name and email are required' },
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

    // Fetch all employees
    const usersUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const usersResponse = await fetch(usersUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    const usersData = await usersResponse.json();
    const employees = usersData?.map((item: any) => {
      const fields = item.document?.fields || {};
      const docPath = item.document?.name || '';
      const docId = docPath.split('/').pop();
      return {
        id: docId,
        name: fields.name?.stringValue || 'Unknown',
        email: fields.email?.stringValue || ''
      };
    }) || [];

    // Fetch all warnings
    const warningsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/warnings`;
    const warningsResponse = await fetch(warningsUrl);
    const warningsDoc = await warningsResponse.json();
    const allWarnings = warningsDoc.documents?.map((doc: any) => {
      const fields = doc.fields || {};
      return {
        employeeId: fields.employeeId?.stringValue || '',
        cost: fields.cost?.doubleValue || 0,
        status: fields.status?.stringValue || 'Active',
        date: fields.date?.stringValue || ''
      };
    }) || [];

    // Fetch all signatures
    const signaturesUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/signatures`;
    const signaturesResponse = await fetch(signaturesUrl);
    const signaturesDoc = await signaturesResponse.json();
    const allSignatures = signaturesDoc.documents?.map((doc: any) => {
      const fields = doc.fields || {};
      return {
        employeeId: fields.employeeId?.stringValue || '',
        policyId: fields.policyId?.stringValue || ''
      };
    }) || [];

    // Fetch all policies
    const policiesUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/policies`;
    const policiesResponse = await fetch(policiesUrl);
    const policiesDoc = await policiesResponse.json();
    const totalPolicies = policiesDoc.documents?.length || 0;

    // Calculate per-employee stats
    const employeeStats = employees.map((emp: any) => {
      const empWarnings = allWarnings.filter((w: any) => w.employeeId === emp.id);
      const empSignatures = allSignatures.filter((s: any) => s.employeeId === emp.id);
      
      return {
        name: emp.name,
        totalWarnings: empWarnings.length,
        activeWarnings: empWarnings.filter((w: any) => w.status === 'Active').length,
        totalPenalties: empWarnings.reduce((sum: number, w: any) => sum + w.cost, 0),
        signedPolicies: empSignatures.length,
        unsignedPolicies: totalPolicies - empSignatures.length
      };
    });

    // Overall stats
    const totalWarnings = allWarnings.length;
    const activeWarnings = allWarnings.filter((w: any) => w.status === 'Active').length;
    const totalPenalties = allWarnings.reduce((sum: number, w: any) => sum + w.cost, 0);

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #c5221f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .stat-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #c5221f; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; background: white; }
    th { background: #c5221f; color: white; padding: 10px; text-align: left; font-size: 12px; }
    td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 12px; }
    tr:hover { background: #f5f5f5; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Weekly Manager Stats Report</h1>
      <p style="margin: 5px 0 0 0;">DAN - The Moving Man</p>
    </div>
    
    <div class="content">
      <h2>Hello ${managerName},</h2>
      <p>Here's your weekly team performance report:</p>
      
      <div class="stat-box">
        <h3 style="margin-top: 0;">📊 Team Overview</h3>
        <p><strong>Total Employees:</strong> ${employees.length}</p>
        <p><strong>Total Warnings Issued:</strong> ${totalWarnings}</p>
        <p><strong>Active Warnings:</strong> ${activeWarnings}</p>
        <p><strong>Total Penalties:</strong> $${totalPenalties.toFixed(2)}</p>
      </div>

      <div class="stat-box">
        <h3 style="margin-top: 0;">👥 Per-Employee Statistics</h3>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Warnings</th>
              <th>Active</th>
              <th>Penalties</th>
              <th>Unsigned Policies</th>
            </tr>
          </thead>
          <tbody>
            ${employeeStats.map((stat: any) => `
              <tr>
                <td><strong>${stat.name}</strong></td>
                <td>${stat.totalWarnings}</td>
                <td>${stat.activeWarnings}</td>
                <td>$${stat.totalPenalties.toFixed(2)}</td>
                <td>${stat.unsignedPolicies > 0 ? `<span style="color: #c5221f;">${stat.unsignedPolicies}</span>` : '✅'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${employeeStats.some((s: any) => s.unsignedPolicies > 0 || s.activeWarnings > 2) ? `
      <div class="alert">
        <h4 style="margin-top: 0;">⚠️ Action Items:</h4>
        <ul style="margin: 5px 0;">
          ${employeeStats.filter((s: any) => s.unsignedPolicies > 0).map((s: any) => 
            `<li><strong>${s.name}</strong> has ${s.unsignedPolicies} unsigned ${s.unsignedPolicies === 1 ? 'policy' : 'policies'}</li>`
          ).join('')}
          ${employeeStats.filter((s: any) => s.activeWarnings > 2).map((s: any) => 
            `<li><strong>${s.name}</strong> has ${s.activeWarnings} active warnings</li>`
          ).join('')}
        </ul>
      </div>
      ` : ''}

      <p style="margin-top: 20px;">Review these statistics and take appropriate action where needed.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated weekly report from DAN - The Moving Man</p>
      <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: [managerEmail],
      subject: `Weekly Team Stats Report - ${new Date().toLocaleDateString()}`,
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
      message: 'Manager stats sent successfully',
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
