import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || "";
    const stripeCustomerId = typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Customer email not found" },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: customerEmail.toLowerCase() },
    });

    let tempPassword: string | null = null;

    if (!user) {
      // Generate temporary password
      tempPassword = crypto.randomBytes(8).toString("hex");
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Parse name
      const nameParts = customerName.split(" ");
      const firstName = nameParts[0] || null;
      const lastName = nameParts.slice(1).join(" ") || null;

      // Create new user
      user = await prisma.user.create({
        data: {
          email: customerEmail.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          role: "agent",
          stripeCustomerId,
          subscriptionId,
          subscriptionStatus: "active",
        },
      });
    } else {
      // Update existing user with subscription info
      tempPassword = crypto.randomBytes(8).toString("hex");
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash, // Reset password for security
          stripeCustomerId,
          subscriptionId,
          subscriptionStatus: "active",
        },
      });
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      tempPassword,
    });
  } catch (error) {
    console.error("Error processing subscription:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
