import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // If user exists but email not verified, resend verification
      if (!existingUser.emailVerified) {
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
          },
        });

        await sendVerificationEmail(
          existingUser.email,
          verificationToken,
          existingUser.firstName
        );

        return NextResponse.json(
          {
            success: true,
            message: "Verification email resent",
            requiresVerification: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with verification token
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        role: "agent",
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken, user.firstName);

    return NextResponse.json(
      {
        success: true,
        user,
        requiresVerification: true,
        message: "Please check your email to verify your account",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "Error";

    return NextResponse.json(
      {
        error: "Internal server error",
        debug: { name: errorName, message: errorMessage }
      },
      { status: 500 }
    );
  }
}
