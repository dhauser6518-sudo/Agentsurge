import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableRecruits } from "@/lib/google-sheets";

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

// POST /api/purchases - Create a purchase (simplified without Stripe)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    const isLicensed = type === "licensed";

    // Get available recruits from Google Sheets
    const availableRecruits = await getAvailableRecruits(isLicensed, qty);

    if (availableRecruits.length < qty) {
      return NextResponse.json(
        { error: `Only ${availableRecruits.length} ${type} recruits available` },
        { status: 400 }
      );
    }

    const purchaseIds: string[] = [];

    // Create recruits and purchase records
    for (const sheetRecruit of availableRecruits) {
      // Create purchase record
      const purchase = await prisma.recruitPurchase.create({
        data: {
          userId: user.id,
          type,
          amountCents: PRICES[type as keyof typeof PRICES],
          status: "delivered",
          deliveredAt: new Date(),
        },
      });

      purchaseIds.push(purchase.id);

      // Create recruit for user
      await prisma.recruit.create({
        data: {
          agentId: user.id,
          firstName: sheetRecruit.firstName,
          lastName: sheetRecruit.lastName,
          phoneNumber: sheetRecruit.phone,
          email: sheetRecruit.email || null,
          igHandle: sheetRecruit.igHandle || null,
          isLicensed,
          licensedAt: isLicensed ? new Date() : null,
          purchaseId: purchase.id,
        },
      });
    }

    const totalAmount = qty * PRICES[type as keyof typeof PRICES];

    return NextResponse.json({
      success: true,
      purchaseIds,
      status: "delivered",
      total: totalAmount / 100,
    });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
