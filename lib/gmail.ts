import nodemailer from 'nodemailer';

// Create Gmail transporter
const createTransporter = () => {
  const gmailUser = process.env.GOOGLE_GMAIL;
  const gmailPassword = process.env.GMAIL_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions) => {
  try {
    const transporter = createTransporter();
    const fromName = process.env.EMAIL_FROM_NAME || 'DAN - The Moving Man';
    const fromEmail = process.env.GOOGLE_GMAIL;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Template for welcome email
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  password: string,
  loginUrl: string
) => {
  const subject = 'Welcome to DAN - The Moving Man';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .credentials { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #667eea; }
        .credential-value { font-family: monospace; background: white; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to the Team!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Welcome to <strong>DAN - The Moving Man</strong>! We're excited to have you on board.</p>
          <p>Your employee account has been created. Here are your login credentials:</p>
          
          <div class="credentials">
            <div class="credential-item">
              <div class="credential-label">Email:</div>
              <div class="credential-value">${email}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">Temporary Password:</div>
              <div class="credential-value">${password}</div>
            </div>
          </div>

          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          
          <center>
            <a href="${loginUrl}" class="button">Login to Your Account</a>
          </center>

          <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to reach out to your manager.</p>
          
          <p>Best regards,<br><strong>DAN - The Moving Man Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

// Template for password reset email
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  password: string,
  loginUrl: string
) => {
  const subject = 'Your Password Has Been Reset';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .credentials { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #667eea; }
        .credential-value { font-family: monospace; background: white; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your password has been reset as requested. Here are your new login credentials:</p>
          
          <div class="credentials">
            <div class="credential-item">
              <div class="credential-label">Email:</div>
              <div class="credential-value">${email}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">New Password:</div>
              <div class="credential-value">${password}</div>
            </div>
          </div>

          <div class="alert">
            <strong>⚠️ Security Notice:</strong> Please change this password immediately after logging in.
          </div>
          
          <center>
            <a href="${loginUrl}" class="button">Login to Your Account</a>
          </center>

          <p style="margin-top: 30px;">If you did not request this password reset, please contact your manager immediately.</p>
          
          <p>Best regards,<br><strong>DAN - The Moving Man Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};
