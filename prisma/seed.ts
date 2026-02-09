import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@agentsurge.com" },
    update: {
      passwordHash: adminPassword,
      emailVerified: true,
    },
    create: {
      email: "admin@agentsurge.com",
      passwordHash: adminPassword,
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      emailVerified: true,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create test agent
  const agentPassword = await bcrypt.hash("agent123", 10);
  const agent = await prisma.user.upsert({
    where: { email: "agent@example.com" },
    update: {
      passwordHash: agentPassword,
      emailVerified: true,
      freeRecruitClaimed: false,
    },
    create: {
      email: "agent@example.com",
      passwordHash: agentPassword,
      role: "agent",
      firstName: "John",
      lastName: "Smith",
      emailVerified: true,
      freeRecruitClaimed: false,
    },
  });
  console.log(`Created agent: ${agent.email}`);

  // Create sample recruits for the agent (unlicensed)
  const unlicensedRecruits = [
    { firstName: "Alice", lastName: "Johnson", phoneNumber: "+15551234567", email: "alice.j@email.com", igHandle: "@alice_johnson", status: "new_recruit" as const },
    { firstName: "Bob", lastName: "Williams", phoneNumber: "+15559876543", email: "bob.w@email.com", igHandle: "bob_williams_insure", status: "contacted" as const },
    { firstName: "Carol", lastName: "Davis", phoneNumber: "+15552468135", email: "carol.d@email.com", igHandle: null, status: "follow_up_needed" as const },
    { firstName: "Eve", lastName: "Wilson", phoneNumber: "+15558642097", email: null, igHandle: "@eve.wilson", status: "not_interested" as const },
  ];

  // Create sample recruits (licensed)
  const licensedRecruits = [
    { firstName: "David", lastName: "Miller", phoneNumber: "+15551357924", email: "david.m@email.com", igHandle: "@davidmiller_agent", status: "signed_up" as const, isLicensed: true, licensedAt: new Date() },
    { firstName: "Frank", lastName: "Brown", phoneNumber: "+15553698741", email: "frank.b@email.com", igHandle: "@frank.brown.insurance", status: "signed_up" as const, isLicensed: true, licensedAt: new Date() },
  ];

  for (const recruit of unlicensedRecruits) {
    await prisma.recruit.create({
      data: {
        agentId: agent.id,
        firstName: recruit.firstName,
        lastName: recruit.lastName,
        phoneNumber: recruit.phoneNumber,
        email: recruit.email,
        igHandle: recruit.igHandle,
        status: recruit.status,
        isLicensed: false,
      },
    });
  }

  for (const recruit of licensedRecruits) {
    await prisma.recruit.create({
      data: {
        agentId: agent.id,
        firstName: recruit.firstName,
        lastName: recruit.lastName,
        phoneNumber: recruit.phoneNumber,
        email: recruit.email,
        igHandle: recruit.igHandle,
        status: recruit.status,
        isLicensed: recruit.isLicensed,
        licensedAt: recruit.licensedAt,
      },
    });
  }
  console.log(`Created ${unlicensedRecruits.length} unlicensed recruits`);
  console.log(`Created ${licensedRecruits.length} licensed recruits`);

  // Create a sample dispute on one recruit
  const firstRecruit = await prisma.recruit.findFirst({
    where: { agentId: agent.id, status: "not_interested" },
  });

  if (firstRecruit) {
    const dispute = await prisma.dispute.create({
      data: {
        recruitId: firstRecruit.id,
        agentId: agent.id,
        reason: "unreachable",
        explanation: "Phone number appears to be disconnected. Called 3 times with no answer.",
        status: "pending_review",
      },
    });

    await prisma.disputeLog.create({
      data: {
        disputeId: dispute.id,
        action: "created",
        performedById: agent.id,
        details: JSON.stringify({
          reason: "unreachable",
          explanation: "Phone number appears to be disconnected. Called 3 times with no answer.",
        }),
      },
    });
    console.log("Created sample dispute");
  }

  console.log("\nSeeding complete!");
  console.log("\nTest credentials:");
  console.log("  Admin: admin@agentsurge.com / admin123");
  console.log("  Agent: agent@example.com / agent123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
