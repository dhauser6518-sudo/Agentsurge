import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableRecruits } from "@/lib/google-sheets";
import crypto from "crypto";

const PRICES = {
  unlicensed: 3500, // $35
  licensed: 5000,   // $50
};

// Hash phone number for anti-abuse tracking
function hashPhone(phone: string): string {
  // Normalize phone: remove all non-digits
  const normalized = phone.replace(/\D/g, "");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

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

    // Check if user is eligible for free first recruit
    const isEligibleForFree = !user.freeRecruitClaimed;

    // Get available recruits from Google Sheets
    const availableRecruits = await getAvailableRecruits(isLicensed, qty);

    if (availableRecruits.length < qty) {
      return NextResponse.json(
        { error: `Only ${availableRecruits.length} ${type} recruits available` },
        { status: 400 }
      );
    }

    const purchaseIds: string[] = [];
    let freeRecruitGiven = false;
    let totalAmount = 0;

    // Create recruits and purchase records
    for (let i = 0; i < availableRecruits.length; i++) {
      const sheetRecruit = availableRecruits[i];
      const isFreeRecruit = isEligibleForFree && i === 0 && !freeRecruitGiven;

      // For free recruit, check anti-abuse: has this phone been used before?
      if (isFreeRecruit) {
        const phoneHash = hashPhone(sheetRecruit.phone);
        const existingClaim = await prisma.freeRecruitClaim.findUnique({
          where: { phoneHash },
        });

        if (existingClaim) {
          // This phone was already used for a free recruit - charge normally
          console.log(`Anti-abuse: Phone hash ${phoneHash.slice(0, 8)}... already claimed free recruit`);
        } else {
          // Valid free recruit - record the claim
          await prisma.freeRecruitClaim.create({
            data: {
              phoneHash,
              userId: user.id,
            },
          });

          // Mark user as having claimed their free recruit
          await prisma.user.update({
            where: { id: user.id },
            data: {
              freeRecruitClaimed: true,
              freeRecruitClaimedAt: new Date(),
            },
          });

          freeRecruitGiven = true;
        }
      }

      const recruitPrice = (isFreeRecruit && freeRecruitGiven)
        ? 0
        : PRICES[type as keyof typeof PRICES];

      totalAmount += recruitPrice;

      // Create purchase record
      const purchase = await prisma.recruitPurchase.create({
        data: {
          userId: user.id,
          type: (isFreeRecruit && freeRecruitGiven) ? "free_first" : type,
          amountCents: recruitPrice,
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

    return NextResponse.json({
      success: true,
      purchaseIds,
      status: "delivered",
      total: totalAmount / 100,
      freeRecruitApplied: freeRecruitGiven,
    });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
