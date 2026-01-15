import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/recruits - List agent's recruits
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status");
    const isLicensed = searchParams.get("isLicensed");

    const where = {
      agentId: session.user.id,
      ...(status && { status: status as "new_recruit" | "contacted" | "follow_up_needed" | "signed_up" | "not_interested" | "do_not_call" }),
      ...(isLicensed !== null && { isLicensed: isLicensed === "true" }),
    };

    const [recruits, total] = await Promise.all([
      prisma.recruit.findMany({
        where,
        include: {
          disputes: {
            select: {
              id: true,
              status: true,
              reason: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.recruit.count({ where }),
    ]);

    return NextResponse.json({
      data: recruits,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching recruits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
