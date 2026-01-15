import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateTempPassword } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/email";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      // Checkout completed (one-time payments or subscription initial)
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      // Subscription lifecycle events
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Invoice events for subscription billing
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Payment intent events for one-click purchases
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// Handle checkout session completed (legacy one-time purchases)
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Skip subscription checkouts - handled by process-subscription API
  if (session.mode === "subscription") {
    console.log("Subscription checkout completed, handled by process-subscription API");
    return;
  }

  const metadata = session.metadata || {};
  const agentEmail = metadata.agent_email || session.customer_email;
  const agentFirstName = metadata.agent_first_name;
  const agentLastName = metadata.agent_last_name;
  const quantity = parseInt(metadata.quantity || "1");

  if (!agentEmail) {
    console.error("No agent email in checkout session:", session.id);
    return;
  }

  // Find or create agent
  let agent = await prisma.user.findUnique({
    where: { email: agentEmail },
  });

  let tempPassword: string | null = null;

  if (!agent) {
    tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    agent = await prisma.user.create({
      data: {
        email: agentEmail,
        passwordHash,
        role: "agent",
        firstName: agentFirstName || null,
        lastName: agentLastName || null,
      },
    });

    console.log(`Created new agent: ${agentEmail}`);
  }

  // Create order record
  await prisma.order.create({
    data: {
      agentId: agent.id,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string || null,
      amountCents: session.amount_total || 0,
      quantity,
      status: "completed",
      metadata: JSON.stringify({
        customerEmail: session.customer_email,
        paymentStatus: session.payment_status,
      }),
    },
  });

  console.log(`Order created for agent ${agentEmail}: ${session.id}`);

  // Send welcome email to new agents
  if (tempPassword) {
    try {
      await sendWelcomeEmail({
        email: agentEmail,
        firstName: agentFirstName || "",
        tempPassword,
        recruitCount: quantity,
      });
      console.log(`Welcome email sent to ${agentEmail}`);
    } catch (emailError) {
      console.error(`Failed to send welcome email to ${agentEmail}:`, emailError);
    }
  }
}

// Handle subscription created/updated
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.log(`No user found for customer ${customerId}`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status === "active" ? "active" : subscription.status,
      subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Subscription updated for user ${user.email}: ${subscription.status}`);
}

// Handle subscription deleted/canceled
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.log(`No user found for customer ${customerId}`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "canceled",
    },
  });

  console.log(`Subscription canceled for user ${user.email}`);
}

// Handle invoice paid (subscription renewal)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;

  if (!customerId) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "active",
    },
  });

  console.log(`Invoice paid for user ${user.email}`);
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;

  if (!customerId) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "past_due",
    },
  });

  console.log(`Invoice payment failed for user ${user.email}`);
}

// Handle payment intent succeeded (recruit purchases)
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;

  // Only process if this is a recruit purchase
  if (!metadata.purchaseIds) {
    return;
  }

  const purchaseIds = metadata.purchaseIds.split(",");

  for (const purchaseId of purchaseIds) {
    const purchase = await prisma.recruitPurchase.findUnique({
      where: { id: purchaseId },
      include: { user: true },
    });

    if (!purchase || purchase.status !== "pending") {
      continue;
    }

    // Get the reserved recruit from pool
    const poolRecruit = await prisma.recruitPool.findFirst({
      where: {
        reservedBy: purchase.userId,
        isAvailable: false,
        isLicensed: purchase.type === "licensed",
      },
    });

    if (!poolRecruit) {
      console.error(`No reserved recruit found for purchase ${purchaseId}`);
      continue;
    }

    // Create the recruit for the user
    const recruit = await prisma.recruit.create({
      data: {
        agentId: purchase.userId,
        firstName: poolRecruit.firstName,
        lastName: poolRecruit.lastName,
        phoneNumber: poolRecruit.phoneNumber,
        email: poolRecruit.email,
        igHandle: poolRecruit.igHandle,
        isLicensed: poolRecruit.isLicensed,
        licensedAt: poolRecruit.isLicensed ? new Date() : null,
        purchaseId: purchase.id,
      },
    });

    // Update purchase status
    await prisma.recruitPurchase.update({
      where: { id: purchaseId },
      data: {
        status: "delivered",
        deliveredAt: new Date(),
      },
    });

    // Remove from pool
    await prisma.recruitPool.delete({
      where: { id: poolRecruit.id },
    });

    console.log(`Recruit ${recruit.id} delivered to user ${purchase.userId}`);
  }
}

// Handle payment intent failed (release reserved recruits)
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;

  if (!metadata.purchaseIds || !metadata.userId) {
    return;
  }

  const purchaseIds = metadata.purchaseIds.split(",");
  const userId = metadata.userId;

  // Release reserved recruits back to pool
  await prisma.recruitPool.updateMany({
    where: {
      reservedBy: userId,
      isAvailable: false,
    },
    data: {
      reservedBy: null,
      reservedAt: null,
      isAvailable: true,
    },
  });

  // Update purchase status
  for (const purchaseId of purchaseIds) {
    await prisma.recruitPurchase.update({
      where: { id: purchaseId },
      data: {
        status: "failed",
      },
    });
  }

  console.log(`Payment failed, released recruits for user ${userId}`);
}
