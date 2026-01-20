import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInventoryCounts } from "@/lib/google-sheets";

// GET /api/inventory - Get available recruit inventory counts from Google Sheets
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get inventory counts from Google Sheets
    const inventory = await getInventoryCounts();

    return NextResponse.json({
      unlicensed: inventory.unlicensed,
      licensed: inventory.licensed,
    });
  } catch (error) {
    console.error("Error fetching inventory from Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
