import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists in database", userId: existingUser.id },
        { status: 409 }
      );
    }

    // Find Stripe customer by email
    const customers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "No Stripe customer found with this email" },
        { status: 404 }
      );
    }

    const stripeCustomer = customers.data[0];

    // Get their subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomer.id,
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    let subscriptionStatus = "inactive";
    let trialEndsAt: Date | null = null;
    let subscriptionId: string | null = null;

    if (subscription) {
      subscriptionId = subscription.id;
      if (subscription.status === "trialing") {
        subscriptionStatus = "trialing";
        trialEndsAt = subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null;
      } else if (subscription.status === "active") {
        subscriptionStatus = "active";
      } else if (subscription.status === "past_due") {
        subscriptionStatus = "past_due";
      }
    }

    // Generate magic link token
    const magicLinkToken = crypto.randomBytes(32).toString("hex");
    const magicLinkExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        stripeCustomerId: stripeCustomer.id,
        subscriptionId,
        subscriptionStatus,
        trialEndsAt,
        emailVerified: true,
        magicLinkToken,
        magicLinkExpires,
        firstName: stripeCustomer.name?.split(" ")[0] || null,
        lastName: stripeCustomer.name?.split(" ").slice(1).join(" ") || null,
      },
    });

    // Send welcome email with magic link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agentsurge.co";
    const magicLinkUrl = `${appUrl}/auth/setup?token=${magicLinkToken}`;

    await resend.emails.send({
      from: "AgentSurge <noreply@agentsurge.co>",
      to: email,
      subject: "Welcome to AgentSurge! Set up your account",
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
              <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px;">Your account is ready!</h2>

              <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
                Click the button below to set up your password and access your dashboard.
              </p>

              <a href="${magicLinkUrl}" style="display: block; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; text-align: center; margin: 0 0 24px;">
                Set Up My Account
              </a>

              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
                This link expires in 24 hours. If you didn't sign up for AgentSurge, you can ignore this email.
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
      },
      message: "Account created and welcome email sent",
    });
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
