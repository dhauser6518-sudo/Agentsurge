import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const testEmail = "demo@agentsurge.co";
  const testPassword = "demo123";
  const passwordHash = await bcrypt.hash(testPassword, 10);

  // Upsert the test user
  const user = await prisma.user.upsert({
    where: { email: testEmail },
    update: {
      passwordHash,
      subscriptionStatus: "active",
      emailVerified: true,
      role: "agent",
    },
    create: {
      email: testEmail,
      passwordHash,
      firstName: "Demo",
      lastName: "Agent",
      role: "agent",
      subscriptionStatus: "active",
      emailVerified: true,
    },
  });

  console.log(`Test user created/updated: ${user.email}`);

  // Check if user has recruits, if not add some
  const existingRecruits = await prisma.recruit.count({
    where: { agentId: user.id },
  });

  if (existingRecruits === 0) {
    const testRecruits = [
      { firstName: "Michael", lastName: "Thompson", phoneNumber: "(555) 234-5678", email: "michael.thompson@email.com", igHandle: "@mike_thompson", status: "new_recruit", isLicensed: true },
      { firstName: "Sarah", lastName: "Johnson", phoneNumber: "(555) 345-6789", email: "sarah.j@email.com", igHandle: "@sarahjohnson", status: "contacted", isLicensed: true },
      { firstName: "James", lastName: "Williams", phoneNumber: "(555) 456-7890", email: "james.williams@email.com", igHandle: "@jameswill", status: "signed_up", isLicensed: true },
      { firstName: "Emily", lastName: "Davis", phoneNumber: "(555) 567-8901", email: "emily.davis@email.com", igHandle: "@emilyd", status: "new_recruit", isLicensed: true },
      { firstName: "Robert", lastName: "Martinez", phoneNumber: "(555) 678-9012", email: "robert.m@email.com", igHandle: "@robmartinez", status: "contacted", isLicensed: true },
      { firstName: "Jessica", lastName: "Brown", phoneNumber: "(555) 789-0123", email: "jessica.b@email.com", igHandle: "@jessb", status: "new_recruit", isLicensed: false },
      { firstName: "David", lastName: "Garcia", phoneNumber: "(555) 890-1234", email: "david.garcia@email.com", igHandle: "@davidg", status: "new_recruit", isLicensed: false },
    ];

    for (const recruit of testRecruits) {
      await prisma.recruit.create({
        data: {
          ...recruit,
          agentId: user.id,
        },
      });
    }
    console.log(`Created ${testRecruits.length} test recruits`);
  } else {
    console.log(`User already has ${existingRecruits} recruits`);
  }

  console.log("\n=================================");
  console.log("TEST CREDENTIALS:");
  console.log("Email: demo@agentsurge.co");
  console.log("Password: demo123");
  console.log("=================================\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
