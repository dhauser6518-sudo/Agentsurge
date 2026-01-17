import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName?: string | null
) {
  const verifyUrl = `${process.env.AUTH_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "AgentSurge <noreply@agentsurge.co>",
    to: email,
    subject: "Verify your email - AgentSurge",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
            <div style="padding: 32px; text-align: center; border-bottom: 1px solid #334155;">
              <h1 style="color: #38bdf8; font-size: 24px; font-weight: 300; letter-spacing: 0.15em; margin: 0;">AGENTSURGE</h1>
              <p style="color: #94a3b8; font-size: 10px; letter-spacing: 0.2em; margin: 4px 0 0 0; text-transform: uppercase;">Recruiting Solutions</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 16px 0;">Verify your email</h2>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                Hi${firstName ? ` ${firstName}` : ""},<br><br>
                Thanks for signing up for AgentSurge! Click the button below to verify your email address and continue setting up your account.
              </p>
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(to right, #0ea5e9, #06b6d4); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 14px;">
                Verify Email
              </a>
              <p style="color: #64748b; font-size: 12px; margin: 24px 0 0 0;">
                This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            <div style="padding: 24px; background-color: #0f172a; text-align: center;">
              <p style="color: #475569; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} AgentSurge. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
