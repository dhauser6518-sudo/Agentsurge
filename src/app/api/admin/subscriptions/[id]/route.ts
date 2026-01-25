import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        subscriptionId: true,
        subscriptionPeriodEnd: true,
        trialEndsAt: true,
        createdAt: true,
        updatedAt: true,
        // Get all purchases with recruit details
        purchases: {
          select: {
            id: true,
            type: true,
            amountCents: true,
            status: true,
            createdAt: true,
            recruit: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        // Get all orders
        orders: {
          select: {
            id: true,
            quantity: true,
            amountCents: true,
            status: true,
            metadata: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        // Get recruits assigned to this user
        recruits: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        // Get disputes
        disputes: {
          select: {
            id: true,
            reason: true,
            status: true,
            createdAt: true,
            recruit: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate summary stats
    const stats = {
      totalPurchases: user.purchases.length,
      totalSpent: user.purchases.reduce((sum, p) => sum + (p.amountCents || 0), 0),
      totalRecruits: user.recruits.length,
      totalDisputes: user.disputes.length,
      pendingDisputes: user.disputes.filter((d) => d.status === "pending_review").length,
    };

    return NextResponse.json({
      user,
      stats,
    });
  } catch (error) {
    console.error("Failed to fetch customer details:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer details" },
      { status: 500 }
    );
  }
}
