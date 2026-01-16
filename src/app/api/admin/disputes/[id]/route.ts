import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_RESOLUTION_ACTIONS = ["replace_recruit", "credit_agent", "mark_invalid"];

// GET /api/admin/disputes/[id] - Get single dispute (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        recruit: true,
        agent: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        logs: {
          orderBy: { createdAt: "asc" },
          include: {
            performedBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    return NextResponse.json({ data: dispute });
  } catch (error) {
    console.error("Error fetching dispute:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/disputes/[id] - Approve or deny dispute (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, adminNotes, resolutionAction } = body;

    // Validate action
    if (!action || !["approve", "deny"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'deny'" },
        { status: 400 }
      );
    }

    // Validate resolution action for approvals
    if (
      action === "approve" &&
      resolutionAction &&
      !VALID_RESOLUTION_ACTIONS.includes(resolutionAction)
    ) {
      return NextResponse.json(
        { error: "Invalid resolution action" },
        { status: 400 }
      );
    }

    // Get dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    if (dispute.status !== "pending_review") {
      return NextResponse.json(
        { error: "This dispute has already been resolved" },
        { status: 400 }
      );
    }

    // Update dispute in transaction
    const updatedDispute = await prisma.$transaction(async (tx: typeof prisma) => {
      const newStatus = action === "approve" ? "approved" : "denied";

      const updated = await tx.dispute.update({
        where: { id },
        data: {
          status: newStatus,
          adminNotes: adminNotes || null,
          resolutionAction: action === "approve" ? resolutionAction || null : null,
          resolvedById: session.user.id,
          resolvedAt: new Date(),
        },
        include: {
          recruit: true,
          agent: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Create audit log
      await tx.disputeLog.create({
        data: {
          disputeId: id,
          action: action === "approve" ? "approved" : "denied",
          performedById: session.user.id,
          details: JSON.stringify({
            adminNotes: adminNotes || null,
            resolutionAction: action === "approve" ? resolutionAction || null : null,
          }),
        },
      });

      return updated;
    });

    return NextResponse.json({ data: updatedDispute });
  } catch (error) {
    console.error("Error updating dispute:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
