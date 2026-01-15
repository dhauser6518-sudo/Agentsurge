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

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
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

  // Note: Recruits are created separately via the /api/recruits/ingest endpoint
  // This webhook only creates the agent account and order record
}
