import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/inventory - Get available recruit inventory counts
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Count available recruits by type
    const [unlicensedCount, licensedCount] = await Promise.all([
      prisma.recruitPool.count({
        where: {
          isAvailable: true,
          isLicensed: false,
        },
      }),
      prisma.recruitPool.count({
        where: {
          isAvailable: true,
          isLicensed: true,
        },
      }),
    ]);

    return NextResponse.json({
      unlicensed: unlicensedCount,
      licensed: licensedCount,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
