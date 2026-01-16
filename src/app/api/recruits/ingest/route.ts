import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/recruits/ingest - Receive recruits from external system
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.INGEST_API_KEY;

    if (!apiKey) {
      console.error("INGEST_API_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const providedKey = authHeader.substring(7);
    if (providedKey !== apiKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { agent_email, recruits, order_reference } = body;

    // Validate required fields
    if (!agent_email) {
      return NextResponse.json(
        { error: "agent_email is required" },
        { status: 400 }
      );
    }

    if (!recruits || !Array.isArray(recruits) || recruits.length === 0) {
      return NextResponse.json(
        { error: "recruits array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate each recruit
    for (const recruit of recruits) {
      // Support either first_name/last_name or full_name
      if (!recruit.full_name && (!recruit.first_name || !recruit.last_name)) {
        return NextResponse.json(
          { error: "Each recruit must have full_name OR first_name and last_name" },
          { status: 400 }
        );
      }
      if (!recruit.phone_number) {
        return NextResponse.json(
          { error: "Each recruit must have phone_number" },
          { status: 400 }
        );
      }
    }

    // Find agent
    const agent = await prisma.user.findUnique({
      where: { email: agent_email },
    });

    if (!agent) {
      return NextResponse.json(
        { error: `Agent not found: ${agent_email}` },
        { status: 404 }
      );
    }

    // Helper to split full name
    const splitName = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      return { firstName, lastName };
    };

    // Collect all order IDs to check for duplicates
    const orderIds = recruits
      .map((r: { order_id?: string }) => r.order_id)
      .filter((id: string | undefined): id is string => !!id);

    // Also include batch-level order_reference if provided
    if (order_reference) {
      orderIds.push(order_reference);
    }

    // Find existing recruits by Order ID to avoid duplicates
    const existingRecruits = orderIds.length > 0
      ? await prisma.recruit.findMany({
          where: { stripeOrderId: { in: orderIds } },
          select: { stripeOrderId: true },
        })
      : [];

    const existingOrderIds = new Set(existingRecruits.map((r: { stripeOrderId: string | null }) => r.stripeOrderId));

    // Filter out recruits that already exist
    const newRecruitData: {
      full_name?: string;
      first_name?: string;
      last_name?: string;
      phone_number: string;
      email?: string;
      ig_handle?: string;
      is_licensed?: boolean;
      order_id?: string;
    }[] = [];
    const skippedOrderIds: string[] = [];

    for (const r of recruits) {
      const orderId = r.order_id || order_reference;
      if (orderId && existingOrderIds.has(orderId)) {
        skippedOrderIds.push(orderId);
      } else {
        newRecruitData.push(r);
      }
    }

    // Create only new recruits
    let createdCount = 0;
    const createdIds: string[] = [];

    if (newRecruitData.length > 0) {
      for (const r of newRecruitData) {
        const { firstName, lastName } = r.full_name
          ? splitName(r.full_name)
          : { firstName: r.first_name!, lastName: r.last_name! };

        const created = await prisma.recruit.create({
          data: {
            agentId: agent.id,
            firstName,
            lastName,
            phoneNumber: r.phone_number,
            email: r.email || null,
            igHandle: r.ig_handle || null,
            isLicensed: r.is_licensed || false,
            licensedAt: r.is_licensed ? new Date() : null,
            stripeOrderId: r.order_id || order_reference || null,
          },
          select: { id: true },
        });

        createdIds.push(created.id);
        createdCount++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        created: createdCount,
        skipped: skippedOrderIds.length,
        skipped_order_ids: skippedOrderIds,
        recruit_ids: createdIds,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error ingesting recruits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
