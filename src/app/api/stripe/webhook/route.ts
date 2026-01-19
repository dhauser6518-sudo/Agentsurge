import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await handleCheckoutCompleted(session);
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;

    await handleSubscriptionUpdated(subscription);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await handleSubscriptionDeleted(subscription);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_email;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!email) {
    console.error("No email in checkout session");
    return;
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null;

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  // Generate magic link token
  const magicLinkToken = crypto.randomBytes(32).toString("hex");
  const magicLinkExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  if (user) {
    // Update existing user
    user = await prisma.user.update({
      where: { email },
      data: {
        stripeCustomerId: customerId,
        subscriptionId: subscriptionId,
        subscriptionStatus: subscription.status === "trialing" ? "trialing" : "active",
        trialEndsAt: trialEnd,
        emailVerified: true,
        magicLinkToken,
        magicLinkExpires,
      },
    });
  } else {
    // Create new user
    user = await prisma.user.create({
      data: {
        email,
        stripeCustomerId: customerId,
        subscriptionId: subscriptionId,
        subscriptionStatus: subscription.status === "trialing" ? "trialing" : "active",
        trialEndsAt: trialEnd,
        emailVerified: true,
        magicLinkToken,
        magicLinkExpires,
      },
    });
  }

  // Send welcome email with magic link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://agentsurge.co";
  const magicLinkUrl = `${appUrl}/auth/setup?token=${magicLinkToken}`;

  try {
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
              <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px;">Welcome aboard! 🎉</h2>

              <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
                Thank you for starting your 7-day free trial. Your account is ready - just click the button below to set up your password and access your dashboard.
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
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  let status = "inactive";
  if (subscription.status === "trialing") status = "trialing";
  else if (subscription.status === "active") status = "active";
  else if (subscription.status === "past_due") status = "past_due";
  else if (subscription.status === "canceled") status = "inactive";

  // Access subscription properties with type assertion for newer Stripe SDK
  const subData = subscription as unknown as {
    current_period_end?: number;
    trial_end?: number | null;
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: status,
      subscriptionPeriodEnd: subData.current_period_end
        ? new Date(subData.current_period_end * 1000)
        : null,
      trialEndsAt: subData.trial_end
        ? new Date(subData.trial_end * 1000)
        : null,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      subscriptionStatus: "inactive",
      subscriptionId: null,
    },
  });
}
