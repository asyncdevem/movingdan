// Email sending using Resend API
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WelcomeEmailParams {
  to: string;
  employeeName: string;
  phone: string;
  password: string;
}

interface WarningEmailParams {
  to: string;
  employeeName: string;
  warningType: string;
  date: string;
  severity: string;
  details: string;
}

interface PolicyEmailParams {
  to: string;
  employeeName: string;
  policyTitle: string;
  policyLink: string;
}

/**
 * Send welcome email to new employee with login credentials
 */
export async function sendWelcomeEmail({ to, employeeName, phone, password }: WelcomeEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'DAN - The Moving Man'} <${process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'}>`,
      to: [to],
      subject: 'Welcome to DAN - The Moving Man Team!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #fafafa; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; }
            .header p { margin: 8px 0 0; font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
            .content { padding: 32px 24px; }
            .content h2 { color: #18181b; font-size: 20px; font-weight: 800; margin: 0 0 16px; }
            .content p { color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
            .credentials { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 24px 0; }
            .credentials h3 { margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 900; text-transform: uppercase; }
            .credential-item { margin: 12px 0; }
            .credential-item strong { display: inline-block; width: 100px; color: #18181b; font-size: 13px; }
            .credential-item span { color: #52525b; font-family: 'Courier New', monospace; background-color: #fff; padding: 4px 8px; border-radius: 4px; border: 1px solid #e4e4e7; }
            .button { display: inline-block; background-color: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0; }
            .footer { background-color: #f4f4f5; padding: 20px 24px; text-align: center; border-top: 1px solid #e4e4e7; }
            .footer p { margin: 0; color: #71717a; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome Aboard!</h1>
              <p>DAN - The Moving Man Compliance Portal</p>
            </div>
            <div class="content">
              <h2>Hi ${employeeName},</h2>
              <p>Welcome to the team! We're excited to have you join DAN - The Moving Man. Your employee account has been created and you now have access to our compliance portal.</p>
              
              <div class="credentials">
                <h3>🔐 Your Login Credentials</h3>
                <div class="credential-item">
                  <strong>Phone:</strong> <span>${phone}</span>
                </div>
                <div class="credential-item">
                  <strong>Password:</strong> <span>${password}</span>
                </div>
              </div>

              <p>Use your phone number and password to sign in to the employee portal. Once logged in, you'll be able to:</p>
              <ul style="color: #52525b; font-size: 14px; line-height: 1.8;">
                <li>Review and sign company policies</li>
                <li>Track your compliance status</li>
                <li>View safety procedures and guidelines</li>
                <li>Access important company updates</li>
              </ul>

              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">Sign In to Portal</a>

              <p style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e4e4e7; font-size: 12px; color: #71717a;">
                <strong>Need help?</strong> Contact your manager or reach out to dan@movingdan.com
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DAN - The Moving Man, LLC. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Send warning notification email
 */
export async function sendWarningEmail({ to, employeeName, warningType, date, severity, details }: WarningEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'DAN - The Moving Man'} <${process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'}>`,
      to: [to],
      subject: `⚠️ ${severity} Warning Issued - ${warningType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #fafafa; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; }
            .content { padding: 32px 24px; }
            .warning-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 24px 0; }
            .warning-box h3 { margin: 0 0 12px; color: #991b1b; font-size: 14px; font-weight: 900; }
            .warning-detail { margin: 10px 0; color: #52525b; font-size: 14px; }
            .warning-detail strong { color: #18181b; }
            .footer { background-color: #f4f4f5; padding: 20px 24px; text-align: center; border-top: 1px solid #e4e4e7; }
            .footer p { margin: 0; color: #71717a; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Warning Notice</h1>
            </div>
            <div class="content">
              <p style="color: #52525b; font-size: 14px; line-height: 1.6;">Hi ${employeeName},</p>
              <p style="color: #52525b; font-size: 14px; line-height: 1.6;">A ${severity.toLowerCase()} has been issued to your account. Please review the details below:</p>
              
              <div class="warning-box">
                <h3>WARNING DETAILS</h3>
                <div class="warning-detail"><strong>Type:</strong> ${warningType}</div>
                <div class="warning-detail"><strong>Date:</strong> ${date}</div>
                <div class="warning-detail"><strong>Severity:</strong> ${severity}</div>
                <div class="warning-detail"><strong>Details:</strong> ${details}</div>
              </div>

              <p style="color: #52525b; font-size: 14px; line-height: 1.6;">Please log in to the portal to review this warning and discuss any questions with your manager.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DAN - The Moving Man, LLC. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send warning email:', error);
    return { success: false, error };
  }
}

/**
 * Send new policy notification email
 */
export async function sendPolicyEmail({ to, employeeName, policyTitle, policyLink }: PolicyEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'DAN - The Moving Man'} <${process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'}>`,
      to: [to],
      subject: `📋 New Policy Requires Signature: ${policyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; background-color: #fafafa; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px 24px; text-align: center; color: white; }
            .content { padding: 32px 24px; }
            .button { display: inline-block; background-color: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 900; font-size: 14px; text-transform: uppercase; margin: 16px 0; }
            .footer { background-color: #f4f4f5; padding: 20px 24px; text-align: center; border-top: 1px solid #e4e4e7; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Policy Available</h1>
            </div>
            <div class="content">
              <p style="color: #52525b; font-size: 14px; line-height: 1.6;">Hi ${employeeName},</p>
              <p style="color: #52525b; font-size: 14px; line-height: 1.6;">A new policy has been added that requires your signature:</p>
              <p style="color: #18181b; font-size: 16px; font-weight: bold; margin: 20px 0;"> ${policyTitle}</p>
              <p style="color: #52525b; font-size: 14px; line-height: 1.6;">Please log in to the portal to review and sign this policy.</p>
              <a href="${policyLink}" class="button">Review Policy</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DAN - The Moving Man, LLC. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send policy email:', error);
    return { success: false, error };
  }
}
