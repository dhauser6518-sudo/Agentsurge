import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
      nodeEnv: process.env.NODE_ENV,
    },
  };

  try {
    // Test database connection
    const userCount = await prisma.user.count();
    checks.database = {
      connected: true,
      userCount,
    };
  } catch (error) {
    checks.database = {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorName: error instanceof Error ? error.name : "Error",
    };
  }

  return NextResponse.json(checks);
}
