/**
 * Firebase Cloud Functions for DAN - The Moving Man
 * Handles email notifications, weekly digests, and scheduled tasks
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin
admin.initializeApp();

// Email transporter configuration
// NOTE: Replace with your actual email service credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST || "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ==========================================
// Email Queue Processor (Triggered on new document)
// ==========================================
export const processEmailQueue = functions.firestore
  .document("emailQueue/{queueId}")
  .onCreate(async (snap, context) => {
    const emailData = snap.data();
    const queueId = context.params.queueId;

    try {
      functions.logger.info(`Processing email queue item: ${queueId}`, emailData);

      // Update status to processing
      await snap.ref.update({ status: "processing" });

      let emailHtml = "";
      let subject = "";
      let recipient = "";

      // Generate email based on type
      switch (emailData.type) {
        case "weekly_digest":
          subject = `📋 Your Weekly Compliance Summary - ${emailData.data.weekStartDate} to ${emailData.data.weekEndDate}`;
          recipient = emailData.data.employeeEmail;
          emailHtml = generateWeeklyDigestEmail(emailData.data);
          break;

        case "warning_issued":
          subject = `⚠️ Written Warning Issued - Action Required`;
          recipient = emailData.data.employeeEmail;
          emailHtml = generateWarningIssuedEmail(emailData.data);
          break;

        case "policy_added":
          subject = `📝 New Policy Requires Your Signature`;
          recipient = emailData.data.employeeEmail;
          emailHtml = generateNewPolicyEmail(emailData.data);
          break;

        default:
          throw new Error(`Unknown email type: ${emailData.type}`);
      }

      // Send email
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || "DAN - The Moving Man"} <${process.env.EMAIL_FROM_ADDRESS || "noreply@movingdan.com"}>`,
        to: recipient,
        subject: subject,
        html: emailHtml,
      };

      await transporter.sendMail(mailOptions);

      // Mark as sent
      await snap.ref.update({
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(`Email sent successfully to ${recipient}`);
    } catch (error) {
      functions.logger.error("Error processing email:", error);

      // Mark as failed
      await snap.ref.update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// ==========================================
// Weekly Digest Scheduler (Runs every Friday at 5 PM)
// ==========================================
export const scheduleWeeklyDigests = functions.pubsub
  .schedule("0 17 * * 5") // Every Friday at 5:00 PM
  .timeZone("America/New_York")
  .onRun(async (context) => {
    functions.logger.info("Starting weekly digest scheduler...");

    try {
      const db = admin.firestore();

      // Get all users with email notifications enabled
      const usersSnapshot = await db
        .collection("users")
        .where("weeklyDigestEnabled", "==", true)
        .get();

      const weekStartDate = getWeekStartDate();
      const weekEndDate = getWeekEndDate();

      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data();

        // Get warnings for this week
        const warningsSnapshot = await db
          .collection("warnings")
          .where("employeeId", "==", userDoc.id)
          .where("createdAt", ">=", weekStartDate)
          .where("createdAt", "<=", weekEndDate)
          .get();

        const warnings = warningsSnapshot.docs.map((doc) => doc.data());

        // Get signatures for this week
        const signaturesSnapshot = await db
          .collection("signatures")
          .where("employeeId", "==", userDoc.id)
          .where("signedAt", ">=", weekStartDate)
          .where("signedAt", "<=", weekEndDate)
          .get();

        const signatures = signaturesSnapshot.docs.map((doc) => doc.data());

        // Add to email queue
        await db.collection("emailQueue").add({
          type: "weekly_digest",
          userId: userDoc.id,
          data: {
            employeeName: user.name,
            employeeEmail: user.email,
            weekStartDate: weekStartDate.toDateString(),
            weekEndDate: weekEndDate.toDateString(),
            newWarnings: warnings,
            newSignatures: signatures,
            totalWarnings: warnings.length,
            totalSignatures: signatures.length,
          },
          status: "pending",
          priority: "normal",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      functions.logger.info(`Scheduled ${usersSnapshot.docs.length} weekly digests`);
    } catch (error) {
      functions.logger.error("Error scheduling weekly digests:", error);
      throw error;
    }
  });

// ==========================================
// Helper Functions
// ==========================================

function getWeekStartDate(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekEndDate(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? 0 : 7);
  const sunday = new Date(now.setDate(diff));
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

// ==========================================
// Email Templates (Matching app theme)
// ==========================================

function getEmailStyles(): string {
  return `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; margin: 0; padding: 0; }
      .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      .email-header { background-color: #18181b; padding: 24px; text-align: center; border-bottom: 4px solid #c5221f; }
      .email-logo { font-size: 20px; font-weight: 900; color: #ffffff; text-transform: uppercase; }
      .email-logo-accent { color: #c5221f; }
      .email-subtitle { font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; }
      .email-body { padding: 32px 24px; }
      .greeting { font-size: 18px; font-weight: 900; color: #18181b; margin-bottom: 12px; text-transform: uppercase; }
      .intro-text { font-size: 13px; color: #52525b; line-height: 1.6; margin-bottom: 24px; font-weight: 600; }
      .card { background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 16px; padding: 16px; margin-bottom: 12px; }
      .card-warning { background-color: #fef2f2; border-color: #fecaca; }
      .card-success { background-color: #f0fdf4; border-color: #bbf7d0; }
      .badge-danger { display: inline-block; font-size: 9px; font-weight: 900; background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; }
      .summary-stats { background-color: #18181b; color: #ffffff; border-radius: 16px; padding: 20px; margin: 24px 0; text-align: center; }
      .stat-number { font-size: 32px; font-weight: 900; color: #c5221f; }
      .cta-button { display: inline-block; background-color: #c5221f; color: #ffffff; font-size: 12px; font-weight: 900; text-transform: uppercase; padding: 14px 28px; border-radius: 12px; text-decoration: none; margin: 20px 0; }
      .email-footer { background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7; }
      .footer-text { font-size: 11px; color: #71717a; line-height: 1.6; font-weight: 600; }
    </style>
  `;
}

function generateWeeklyDigestEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Weekly Compliance Summary</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="email-logo">DAN <span class="email-logo-accent">- THE MOVING MAN</span></div>
          <div class="email-subtitle">Weekly Compliance Report</div>
        </div>
        <div class="email-body">
          <div class="greeting">Hello ${data.employeeName},</div>
          <p class="intro-text">Your weekly compliance summary for ${data.weekStartDate} to ${data.weekEndDate}.</p>
          <div class="summary-stats">
            <div class="stat-number">${data.totalWarnings}</div>
            <div style="font-size: 11px; color: #a1a1aa; margin-top: 6px;">New Warnings</div>
          </div>
          <div style="text-align: center;">
            <a href="https://movingdan.app" class="cta-button">View Dashboard</a>
          </div>
        </div>
        <div class="email-footer">
          <p class="footer-text"><strong>DAN - THE MOVING MAN</strong><br>Compliance Portal</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateWarningIssuedEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Warning Issued</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="email-logo">DAN <span class="email-logo-accent">- THE MOVING MAN</span></div>
          <div class="email-subtitle">⚠️ Disciplinary Notice</div>
        </div>
        <div class="email-body">
          <div class="greeting">Notice: ${data.employeeName}</div>
          <p class="intro-text">A written warning has been issued to your account.</p>
          <div class="card card-warning">
            <h3 style="margin: 0 0 8px 0; font-size: 13px;">${data.warningType}</h3>
            <p style="margin: 0; font-size: 12px; color: #3f3f46;">"${data.incidentDetails}"</p>
            <div style="margin-top: 12px; font-size: 11px; color: #71717a;">Cost: $${data.cost} • <span class="badge-danger">${data.severity}</span></div>
          </div>
          <div style="text-align: center;">
            <a href="https://movingdan.app" class="cta-button">View Warning</a>
          </div>
        </div>
        <div class="email-footer">
          <p class="footer-text"><strong>DAN - THE MOVING MAN</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateNewPolicyEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Policy</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="email-logo">DAN <span class="email-logo-accent">- THE MOVING MAN</span></div>
          <div class="email-subtitle">📋 New Policy Notification</div>
        </div>
        <div class="email-body">
          <div class="greeting">Hello ${data.employeeName},</div>
          <p class="intro-text">A new policy requires your signature.</p>
          <div class="card">
            <h3 style="margin: 0 0 8px 0; font-size: 13px;">${data.policyTitle}</h3>
            <p style="margin: 0; font-size: 12px; color: #3f3f46;">${data.policyDescription}</p>
          </div>
          <div style="text-align: center;">
            <a href="https://movingdan.app/policies" class="cta-button">Read & Sign</a>
          </div>
        </div>
        <div class="email-footer">
          <p class="footer-text"><strong>DAN - THE MOVING MAN</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
