import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Verify magic link token
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { magicLinkToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  if (user.magicLinkExpires && user.magicLinkExpires < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    email: user.email,
    hasPassword: !!user.passwordHash,
  });
}

// POST - Set password and complete setup
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { magicLinkToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (user.magicLinkExpires && user.magicLinkExpires < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user with password and clear magic link
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        magicLinkToken: null,
        magicLinkExpires: null,
      },
    });

    return NextResponse.json({ success: true, email: user.email });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to complete setup" },
      { status: 500 }
    );
  }
}
