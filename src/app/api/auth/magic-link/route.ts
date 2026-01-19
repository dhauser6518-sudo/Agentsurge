import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate magic link token
    const magicLinkToken = crypto.randomBytes(32).toString("hex");
    const magicLinkExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicLinkToken,
        magicLinkExpires,
      },
    });

    // Send magic link email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agentsurge.co";
    const hasPassword = !!user.passwordHash;
    const magicLinkUrl = hasPassword
      ? `${appUrl}/auth/reset-password?token=${magicLinkToken}`
      : `${appUrl}/auth/setup?token=${magicLinkToken}`;

    try {
      await resend.emails.send({
        from: "AgentSurge <noreply@agentsurge.co>",
        to: email,
        subject: hasPassword ? "Reset your password" : "Complete your account setup",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 0.1em;">AGENTSURGE</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 12px; letter-spacing: 0.15em;">RECRUITING SOLUTIONS</p>
              </div>

              <div style="padding: 32px;">
                <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px;">
                  ${hasPassword ? "Reset Your Password" : "Complete Your Setup"}
                </h2>

                <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
                  ${hasPassword
                    ? "Click the button below to reset your password."
                    : "Click the button below to set up your password and access your account."
                  }
                </p>

                <a href="${magicLinkUrl}" style="display: block; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; margin: 0 0 24px;">
                  ${hasPassword ? "Reset Password" : "Set Up Account"}
                </a>

                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
                  This link expires in 1 hour. If you didn't request this, you can ignore this email.
                </p>
              </div>

              <div style="background: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
                  © ${new Date().getFullYear()} AgentSurge. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (error) {
      console.error("Failed to send magic link email:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
