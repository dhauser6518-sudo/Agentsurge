import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["new_recruit", "contacted", "follow_up_needed", "signed_up", "not_interested", "do_not_call"];

// GET /api/recruits/[id] - Get single recruit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruit = await prisma.recruit.findFirst({
      where: {
        id,
        agentId: session.user.id,
      },
      include: {
        disputes: true,
      },
    });

    if (!recruit) {
      return NextResponse.json({ error: "Recruit not found" }, { status: 404 });
    }

    return NextResponse.json({ data: recruit });
  } catch (error) {
    console.error("Error fetching recruit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/recruits/[id] - Update recruit status or notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, notes, isLicensed } = body;

    // Verify ownership
    const recruit = await prisma.recruit.findFirst({
      where: {
        id,
        agentId: session.user.id,
      },
    });

    if (!recruit) {
      return NextResponse.json({ error: "Recruit not found" }, { status: 404 });
    }

    // Build update data - only allow status, notes, and isLicensed
    const updateData: { status?: string; notes?: string; isLicensed?: boolean; licensedAt?: Date | null } = {};

    if (status && VALID_STATUSES.includes(status)) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (typeof isLicensed === "boolean") {
      updateData.isLicensed = isLicensed;
      updateData.licensedAt = isLicensed ? new Date() : null;
    }

    const updated = await prisma.recruit.update({
      where: { id },
      data: updateData,
      include: {
        disputes: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating recruit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
