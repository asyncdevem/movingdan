// Email Templates matching DAN - The Moving Man theme

export const getEmailStyles = () => `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #fafafa;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-header {
      background-color: #18181b;
      padding: 24px;
      text-align: center;
      border-bottom: 4px solid #c5221f;
    }
    .email-logo {
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .email-logo-accent {
      color: #c5221f;
    }
    .email-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-top: 4px;
    }
    .email-body {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 900;
      color: #18181b;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: -0.3px;
    }
    .intro-text {
      font-size: 13px;
      color: #52525b;
      line-height: 1.6;
      margin-bottom: 24px;
      font-weight: 600;
    }
    .section-title {
      font-size: 12px;
      font-weight: 900;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-top: 28px;
      margin-bottom: 12px;
      border-bottom: 2px solid #f4f4f5;
      padding-bottom: 8px;
    }
    .card {
      background-color: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .card-warning {
      background-color: #fef2f2;
      border-color: #fecaca;
    }
    .card-success {
      background-color: #f0fdf4;
      border-color: #bbf7d0;
    }
    .card-title {
      font-size: 13px;
      font-weight: 900;
      color: #18181b;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .card-meta {
      font-size: 11px;
      color: #71717a;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .card-content {
      font-size: 12px;
      color: #3f3f46;
      line-height: 1.5;
      font-weight: 600;
      font-style: italic;
      background-color: #ffffff;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid #e4e4e7;
    }
    .badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 12px;
      letter-spacing: 0.8px;
    }
    .badge-danger {
      background-color: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    .badge-warning {
      background-color: #fffbeb;
      color: #d97706;
      border: 1px solid #fde68a;
    }
    .badge-success {
      background-color: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }
    .summary-stats {
      background-color: #18181b;
      color: #ffffff;
      border-radius: 16px;
      padding: 20px;
      margin: 24px 0;
      text-align: center;
    }
    .stat-number {
      font-size: 32px;
      font-weight: 900;
      color: #c5221f;
      line-height: 1;
    }
    .stat-label {
      font-size: 11px;
      font-weight: 700;
      color: #a1a1aa;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 6px;
    }
    .cta-button {
      display: inline-block;
      background-color: #c5221f;
      color: #ffffff;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 14px 28px;
      border-radius: 12px;
      text-decoration: none;
      margin: 20px 0;
    }
    .email-footer {
      background-color: #fafafa;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e4e4e7;
    }
    .footer-text {
      font-size: 11px;
      color: #71717a;
      line-height: 1.6;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background-color: #e4e4e7;
      margin: 24px 0;
    }
    .no-items {
      text-align: center;
      padding: 24px;
      font-size: 12px;
      color: #71717a;
      font-weight: 700;
    }
  </style>
`;

// ==========================================
// Weekly Digest Email Template
// ==========================================
export const generateWeeklyDigestEmail = (data: {
  employeeName: string;
  weekStartDate: string;
  weekEndDate: string;
  newWarnings: any[];
  newSignatures: any[];
  totalWarnings: number;
  totalSignatures: number;
}) => {
  const hasWarnings = data.newWarnings.length > 0;
  const hasSignatures = data.newSignatures.length > 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Compliance Summary</title>
  ${getEmailStyles()}
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <div class="email-logo">
        DAN <span class="email-logo-accent">- THE MOVING MAN</span>
      </div>
      <div class="email-subtitle">Weekly Compliance Report</div>
    </div>

    <!-- Body -->
    <div class="email-body">
      <div class="greeting">Hello ${data.employeeName},</div>
      
      <p class="intro-text">
        This is your weekly compliance summary for the period of <strong>${data.weekStartDate}</strong> to <strong>${data.weekEndDate}</strong>. 
        Review your acknowledgments, warnings, and documentation below.
      </p>

      <!-- Summary Stats -->
      <div class="summary-stats">
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 120px; padding: 10px;">
            <div class="stat-number">${data.newWarnings.length}</div>
            <div class="stat-label">New Warnings This Week</div>
          </div>
          <div style="flex: 1; min-width: 120px; padding: 10px;">
            <div class="stat-number">${data.newSignatures.length}</div>
            <div class="stat-label">Policies Signed</div>
          </div>
        </div>
      </div>

      <!-- Warnings Section -->
      <div class="section-title">⚠️ Warnings & Infractions</div>
      ${hasWarnings ? data.newWarnings.map(warning => `
        <div class="card card-warning">
          <div class="card-title">${warning.warningType || 'Warning'}</div>
          <div class="card-meta">
            Issued ${warning.date} • Cost: $${warning.cost} • 
            <span class="badge ${warning.severity === 'Final Warning' ? 'badge-danger' : 'badge-warning'}">${warning.severity}</span>
          </div>
          <div class="card-content">
            "${warning.incidentDetails || warning.details}"
          </div>
        </div>
      `).join('') : `
        <div class="no-items">
          ✅ <strong>Perfect Week!</strong> No warnings issued. Keep up the excellent work.
        </div>
      `}

      <!-- Policy Signatures Section -->
      <div class="section-title">📋 Policy Acknowledgments</div>
      ${hasSignatures ? data.newSignatures.map(sig => `
        <div class="card card-success">
          <div class="card-title">${sig.policyTitle}</div>
          <div class="card-meta">
            Signed on ${new Date(sig.signedAt).toLocaleDateString()} at ${new Date(sig.signedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            <span class="badge badge-success">✓ Completed</span>
          </div>
        </div>
      `).join('') : `
        <div class="no-items">
          No new policies signed this week. Check the app for pending acknowledgments.
        </div>
      `}

      <div class="divider"></div>

      <!-- Call to Action -->
      <div style="text-align: center;">
        <a href="https://movingdan.app" class="cta-button">
          View Full Compliance Dashboard
        </a>
        <p style="font-size: 11px; color: #71717a; margin-top: 12px; font-weight: 600;">
          Questions? Contact Dan at <a href="mailto:dan@movingdan.com" style="color: #c5221f; text-decoration: none;">dan@movingdan.com</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p class="footer-text">
        <strong>DAN - THE MOVING MAN</strong><br>
        Compliance Portal • Operations Management System<br>
        <br>
        This is an automated message. To update your email preferences, 
        <a href="https://movingdan.app/settings" style="color: #c5221f; text-decoration: none;">click here</a>.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// ==========================================
// Warning Issued Email Template
// ==========================================
export const generateWarningIssuedEmail = (data: {
  employeeName: string;
  warningType: string;
  warningDate: string;
  severity: string;
  incidentDetails: string;
  cost: number;
  issuedBy: string;
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Warning Issued</title>
  ${getEmailStyles()}
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="email-logo">
        DAN <span class="email-logo-accent">- THE MOVING MAN</span>
      </div>
      <div class="email-subtitle">⚠️ Disciplinary Notice</div>
    </div>

    <div class="email-body">
      <div class="greeting">Notice: ${data.employeeName}</div>
      
      <p class="intro-text">
        A written warning has been issued to your account. Please review the details below and contact your supervisor if you have any questions.
      </p>

      <div class="card card-warning">
        <div class="card-title">${data.warningType}</div>
        <div class="card-meta">
          Issued ${data.warningDate} • Cost: $${data.cost} • 
          <span class="badge ${data.severity === 'Final Warning' ? 'badge-danger' : 'badge-warning'}">${data.severity}</span>
        </div>
        <div class="card-content">
          "${data.incidentDetails}"
        </div>
        <div style="margin-top: 12px; font-size: 11px; color: #71717a; font-weight: 700;">
          Issued by: ${data.issuedBy}
        </div>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-top: 20px;">
        <p style="font-size: 12px; color: #92400e; margin: 0; font-weight: 700; line-height: 1.6;">
          <strong>⚡ Action Required:</strong> Please acknowledge this warning in the app and reach out to your crew lead to discuss improvement steps.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="https://movingdan.app" class="cta-button">
          View Warning in App
        </a>
      </div>
    </div>

    <div class="email-footer">
      <p class="footer-text">
        <strong>DAN - THE MOVING MAN</strong><br>
        This is an official company notice.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// ==========================================
// New Policy Added Email Template
// ==========================================
export const generateNewPolicyEmail = (data: {
  employeeName: string;
  policyTitle: string;
  policyDescription: string;
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Policy Available</title>
  ${getEmailStyles()}
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="email-logo">
        DAN <span class="email-logo-accent">- THE MOVING MAN</span>
      </div>
      <div class="email-subtitle">📋 New Policy Notification</div>
    </div>

    <div class="email-body">
      <div class="greeting">Hello ${data.employeeName},</div>
      
      <p class="intro-text">
        A new company policy has been added and requires your digital signature acknowledgment.
      </p>

      <div class="card">
        <div class="card-title">${data.policyTitle}</div>
        <div class="card-content">
          ${data.policyDescription}
        </div>
      </div>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-top: 20px;">
        <p style="font-size: 12px; color: #991b1b; margin: 0; font-weight: 700; line-height: 1.6;">
          <strong>📝 Signature Required:</strong> You must read and digitally sign this policy in the app before your next shift.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="https://movingdan.app/policies" class="cta-button">
          Read & Sign Policy
        </a>
      </div>
    </div>

    <div class="email-footer">
      <p class="footer-text">
        <strong>DAN - THE MOVING MAN</strong><br>
        Compliance is mandatory for all team members.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
