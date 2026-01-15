import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

const PRICES = {
  unlicensed: 3500, // $35
  licensed: 5000,   // $50
};

// GET /api/purchases - Get user's purchase history
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchases = await prisma.recruitPurchase.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        recruit: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}

// POST /api/purchases - Create a one-click purchase
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify active subscription
    if (user.subscriptionStatus !== "active") {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "Payment method not configured" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, quantity } = body;

    // Validate request
    if (!type || !["unlicensed", "licensed"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid recruit type" },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1 || qty > 10) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Check inventory
    const availableCount = await prisma.recruitPool.count({
      where: {
        isAvailable: true,
        isLicensed: type === "licensed",
      },
    });

    if (availableCount < qty) {
      return NextResponse.json(
        { error: `Only ${availableCount} ${type} recruits available` },
        { status: 400 }
      );
    }

    // Reserve recruits from pool
    const recruitsToReserve = await prisma.recruitPool.findMany({
      where: {
        isAvailable: true,
        isLicensed: type === "licensed",
      },
      take: qty,
    });

    // Mark as reserved
    await prisma.recruitPool.updateMany({
      where: {
        id: { in: recruitsToReserve.map(r => r.id) },
      },
      data: {
        isAvailable: false,
        reservedBy: user.id,
        reservedAt: new Date(),
      },
    });

    // Create purchase records
    const purchaseRecords = await Promise.all(
      recruitsToReserve.map(recruit =>
        prisma.recruitPurchase.create({
          data: {
            userId: user.id,
            recruitPoolId: recruit.id,
            type,
            amountCents: PRICES[type as keyof typeof PRICES],
            status: "pending",
          },
        })
      )
    );

    const purchaseIds = purchaseRecords.map(p => p.id);
    const totalAmount = qty * PRICES[type as keyof typeof PRICES];

    // Get customer's default payment method
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);

    if (customer.deleted) {
      // Release reservations
      await releaseReservations(user.id, purchaseIds);
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 400 }
      );
    }

    const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;

    if (!defaultPaymentMethod) {
      // Try to get any payment method
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
        limit: 1,
      });

      if (paymentMethods.data.length === 0) {
        await releaseReservations(user.id, purchaseIds);
        return NextResponse.json(
          { error: "No payment method on file" },
          { status: 400 }
        );
      }
    }

    // Create and confirm payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "usd",
      customer: user.stripeCustomerId,
      payment_method: defaultPaymentMethod as string || undefined,
      off_session: true,
      confirm: true,
      metadata: {
        userId: user.id,
        purchaseIds: purchaseIds.join(","),
        type,
        quantity: qty.toString(),
      },
    });

    // Update purchases with payment intent ID
    await prisma.recruitPurchase.updateMany({
      where: { id: { in: purchaseIds } },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    // If payment succeeded immediately, deliver recruits
    if (paymentIntent.status === "succeeded") {
      await deliverRecruits(purchaseIds, recruitsToReserve, user.id, type === "licensed");
    }

    return NextResponse.json({
      success: true,
      purchaseIds,
      status: paymentIntent.status,
      total: totalAmount / 100,
    });
  } catch (error) {
    console.error("Error creating purchase:", error);

    // Handle Stripe card errors
    if (error instanceof Stripe.errors.StripeCardError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}

// Helper to release reservations on failure
async function releaseReservations(userId: string, purchaseIds: string[]) {
  await prisma.recruitPool.updateMany({
    where: { reservedBy: userId },
    data: {
      isAvailable: true,
      reservedBy: null,
      reservedAt: null,
    },
  });

  await prisma.recruitPurchase.updateMany({
    where: { id: { in: purchaseIds } },
    data: { status: "failed" },
  });
}

// Helper to deliver recruits immediately
async function deliverRecruits(
  purchaseIds: string[],
  poolRecruits: { id: string; firstName: string; lastName: string; phoneNumber: string; email: string | null; igHandle: string | null }[],
  userId: string,
  isLicensed: boolean
) {
  for (let i = 0; i < purchaseIds.length; i++) {
    const purchase = purchaseIds[i];
    const poolRecruit = poolRecruits[i];

    // Create recruit
    await prisma.recruit.create({
      data: {
        agentId: userId,
        firstName: poolRecruit.firstName,
        lastName: poolRecruit.lastName,
        phoneNumber: poolRecruit.phoneNumber,
        email: poolRecruit.email,
        igHandle: poolRecruit.igHandle,
        isLicensed,
        licensedAt: isLicensed ? new Date() : null,
        purchaseId: purchase,
      },
    });

    // Update purchase
    await prisma.recruitPurchase.update({
      where: { id: purchase },
      data: {
        status: "delivered",
        deliveredAt: new Date(),
      },
    });

    // Remove from pool
    await prisma.recruitPool.delete({
      where: { id: poolRecruit.id },
    });
  }
}
