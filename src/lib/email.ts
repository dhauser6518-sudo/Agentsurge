// Email service for sending transactional emails
// Supports multiple providers: Resend (recommended), SendGrid, or SMTP

interface WelcomeEmailParams {
  email: string;
  firstName: string;
  tempPassword: string;
  recruitCount: number;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Resend email provider
async function sendWithResend(
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "noreply@agentsurge.com";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  const data = await response.json();
  return { success: true, messageId: data.id };
}

// SendGrid email provider
async function sendWithSendGrid(
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "noreply@agentsurge.com";

  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY not configured");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return { success: true, messageId: response.headers.get("x-message-id") || undefined };
}

// Generic send function that picks the configured provider
async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  const provider = process.env.EMAIL_PROVIDER || "resend";

  switch (provider.toLowerCase()) {
    case "resend":
      return sendWithResend(to, subject, html);
    case "sendgrid":
      return sendWithSendGrid(to, subject, html);
    default:
      throw new Error(`Unknown email provider: ${provider}`);
  }
}

// Welcome email template
function getWelcomeEmailHtml(params: WelcomeEmailParams): string {
  const { firstName, tempPassword, recruitCount } = params;
  const loginUrl = process.env.AUTH_URL || "https://app.agentsurge.com";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AgentSurge</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to AgentSurge!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${firstName || "there"},
              </p>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for your purchase! Your account has been created and you now have access to <strong>${recruitCount} recruit${recruitCount !== 1 ? "s" : ""}</strong> in your dashboard.
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 16px; color: #1e293b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Your Login Credentials
                </p>
                <p style="margin: 0 0 8px; color: #374151; font-size: 15px;">
                  <strong>Email:</strong> ${params.email}
                </p>
                <p style="margin: 0; color: #374151; font-size: 15px;">
                  <strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code>
                </p>
              </div>

              <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Please change your password after your first login for security.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 8px;">
                    <a href="${loginUrl}/login" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Login to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                If you have any questions, reply to this email and we'll be happy to help.
              </p>

              <p style="margin: 24px 0 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>The AgentSurge Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                This email was sent because you made a purchase at AgentSurge.<br>
                If you didn't make this purchase, please contact support immediately.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Send welcome email to new agents
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<EmailResult> {
  const subject = "Welcome to AgentSurge - Your Login Credentials";
  const html = getWelcomeEmailHtml(params);

  return sendEmail(params.email, subject, html);
}
