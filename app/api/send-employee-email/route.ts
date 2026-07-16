import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 style="margin: 16px 0 8px; color: #18181b; font-size: 16px; font-weight: 800;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="margin: 20px 0 10px; color: #18181b; font-size: 18px; font-weight: 900;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="margin: 24px 0 12px; color: #18181b; font-size: 20px; font-weight: 900;">$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #18181b;">$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" style="color: #ef4444; text-decoration: underline;">$1</a>');
  
  // Bullet lists
  html = html.replace(/^\* (.+)$/gim, '<li style="margin: 4px 0; color: #18181b; font-size: 14px;">$1</li>');
  html = html.replace(/(<li[\s\S]*<\/li>)/gim, '<ul style="margin: 12px 0; padding-left: 24px; list-style-type: disc;">$1</ul>');
  
  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gim, '<li style="margin: 4px 0; color: #18181b; font-size: 14px;">$1</li>');
  
  // Line breaks and paragraphs
  html = html.split('\n\n').map(para => {
    if (para.trim().startsWith('<h') || para.trim().startsWith('<ul') || para.trim().startsWith('<ol') || para.trim().startsWith('<li')) {
      return para;
    }
    return `<p style="margin: 12px 0; color: #18181b; font-size: 14px; line-height: 1.6;">${para.replace(/\n/g, '<br>')}</p>`;
  }).join('');
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
  
  return html;
}

export async function POST(request: NextRequest) {
  try {
    const { to, toName, subject, message, fromName } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert markdown to HTML
    const htmlMessage = markdownToHtml(message);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `${fromName || "Manager"} <onboarding@resend.dev>`,
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%); padding: 32px 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">
                          DAN <span style="color: #ef4444;">- The Moving Man</span>
                        </h1>
                        <p style="margin: 8px 0 0; color: #a1a1aa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                          Compliance Management Portal
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 8px; color: #71717a; font-size: 12px; font-weight: 600;">
                          Hi ${toName || "there"},
                        </p>
                        
                        <div style="margin: 24px 0; padding: 24px; background-color: #f4f4f5; border-left: 4px solid #ef4444; border-radius: 8px;">
                          <div style="color: #18181b; font-size: 14px; font-weight: 500; line-height: 1.6;">
${htmlMessage}
                          </div>
                        </div>

                        <p style="margin: 24px 0 0; color: #71717a; font-size: 12px; font-weight: 500; line-height: 1.5;">
                          Best regards,<br>
                          <strong>${fromName || "Management Team"}</strong><br>
                          DAN - The Moving Man
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
                        <p style="margin: 0; color: #a1a1aa; font-size: 11px; font-weight: 600;">
                          © ${new Date().getFullYear()} DAN - The Moving Man, LLC. All rights reserved.
                        </p>
                        <p style="margin: 8px 0 0; color: #d4d4d8; font-size: 10px; font-weight: 500;">
                          This is an automated message from your compliance management system.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: data?.id,
    });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
