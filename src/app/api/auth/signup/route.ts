import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/resend";

// Meta Conversions API helper for Lead event
async function sendMetaLeadEvent(email: string) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !accessToken) {
    console.log("Meta Conversions API not configured, skipping Lead event");
    return;
  }

  // Hash email with SHA256 (required by Meta)
  const hashedEmail = crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              user_data: {
                em: [hashedEmail],
              },
            },
          ],
          access_token: accessToken,
        }),
      }
    );

    const result = await response.json();
    console.log("Meta Lead event sent:", result);
  } catch (error) {
    console.error("Failed to send Meta Lead event:", error);
  }
}

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

        try {
          console.log("Resending verification email to:", existingUser.email);
          await sendVerificationEmail(
            existingUser.email,
            verificationToken,
            existingUser.firstName
          );
          console.log("Verification email resent successfully to:", existingUser.email);
        } catch (emailError) {
          console.error("Failed to resend verification email:", emailError);
          return NextResponse.json(
            {
              success: true,
              message: "Account exists but verification email failed to send. Please contact support.",
              requiresVerification: true,
              emailError: emailError instanceof Error ? emailError.message : "Unknown email error",
            },
            { status: 200 }
          );
        }

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

    // Send Meta Lead event via Conversions API
    sendMetaLeadEvent(user.email);

    // Send verification email
    try {
      console.log("Attempting to send verification email to:", user.email);
      await sendVerificationEmail(user.email, verificationToken, user.firstName);
      console.log("Verification email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Still return success since account was created, but note email failed
      return NextResponse.json(
        {
          success: true,
          user,
          requiresVerification: true,
          message: "Account created but verification email failed to send. Please contact support.",
          emailError: emailError instanceof Error ? emailError.message : "Unknown email error",
        },
        { status: 201 }
      );
    }

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
