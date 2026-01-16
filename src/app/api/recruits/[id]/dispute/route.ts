import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_REASONS = ["wrong_info", "unreachable", "duplicate", "invalid_recruit", "other"];

// POST /api/recruits/[id]/dispute - Submit a dispute
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: recruitId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reason, explanation } = body;

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "Invalid dispute reason" },
        { status: 400 }
      );
    }

    // Require explanation for "other"
    if (reason === "other" && !explanation?.trim()) {
      return NextResponse.json(
        { error: "Explanation required for 'Other' disputes" },
        { status: 400 }
      );
    }

    // Verify recruit ownership
    const recruit = await prisma.recruit.findFirst({
      where: {
        id: recruitId,
        agentId: session.user.id,
      },
      include: {
        disputes: {
          where: {
            status: "pending_review",
          },
        },
      },
    });

    if (!recruit) {
      return NextResponse.json({ error: "Recruit not found" }, { status: 404 });
    }

    // Check for existing pending dispute
    if (recruit.disputes.length > 0) {
      return NextResponse.json(
        { error: "This recruit already has a pending dispute" },
        { status: 400 }
      );
    }

    // Create dispute with audit log in a transaction
    const dispute = await prisma.$transaction(async (tx) => {
      const newDispute = await tx.dispute.create({
        data: {
          recruitId,
          agentId: session.user.id,
          reason,
          explanation: explanation || null,
        },
      });

      // Create audit log
      await tx.disputeLog.create({
        data: {
          disputeId: newDispute.id,
          action: "created",
          performedById: session.user.id,
          details: JSON.stringify({
            reason,
            explanation: explanation || null,
          }),
        },
      });

      return newDispute;
    });

    return NextResponse.json({ data: dispute }, { status: 201 });
  } catch (error) {
    console.error("Error creating dispute:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
