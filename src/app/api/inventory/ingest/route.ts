import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/inventory/ingest - Add recruits to the pool (admin/API key protected)
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
    const { recruits } = body;

    if (!recruits || !Array.isArray(recruits) || recruits.length === 0) {
      return NextResponse.json(
        { error: "recruits array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Validate each recruit
    for (const recruit of recruits) {
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

    // Helper to split full name
    const splitName = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      return { firstName, lastName };
    };

    // Add recruits to pool
    const created = await prisma.recruitPool.createMany({
      data: recruits.map((r: {
        full_name?: string;
        first_name?: string;
        last_name?: string;
        phone_number: string;
        email?: string;
        ig_handle?: string;
        is_licensed?: boolean;
        source_sheet?: string;
        source_row_id?: string;
      }) => {
        const { firstName, lastName } = r.full_name
          ? splitName(r.full_name)
          : { firstName: r.first_name!, lastName: r.last_name! };

        return {
          firstName,
          lastName,
          phoneNumber: r.phone_number,
          email: r.email || null,
          igHandle: r.ig_handle || null,
          isLicensed: r.is_licensed || false,
          sourceSheet: r.source_sheet || null,
          sourceRowId: r.source_row_id || null,
          isAvailable: true,
        };
      }),
    });

    return NextResponse.json({
      success: true,
      added: created.count,
    }, { status: 201 });
  } catch (error) {
    console.error("Error ingesting to pool:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
