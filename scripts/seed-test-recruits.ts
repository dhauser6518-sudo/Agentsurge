import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const testRecruits = [
  {
    firstName: "Michael",
    lastName: "Thompson",
    phoneNumber: "(555) 234-5678",
    email: "michael.thompson@email.com",
    igHandle: "@mike_thompson",
    status: "new_recruit",
    isLicensed: true,
  },
  {
    firstName: "Sarah",
    lastName: "Johnson",
    phoneNumber: "(555) 345-6789",
    email: "sarah.j@email.com",
    igHandle: "@sarahjohnson",
    status: "contacted",
    isLicensed: true,
  },
  {
    firstName: "James",
    lastName: "Williams",
    phoneNumber: "(555) 456-7890",
    email: "james.williams@email.com",
    igHandle: "@jameswill",
    status: "signed_up",
    isLicensed: true,
  },
  {
    firstName: "Emily",
    lastName: "Davis",
    phoneNumber: "(555) 567-8901",
    email: "emily.davis@email.com",
    igHandle: "@emilyd",
    status: "new_recruit",
    isLicensed: true,
  },
  {
    firstName: "Robert",
    lastName: "Martinez",
    phoneNumber: "(555) 678-9012",
    email: "robert.m@email.com",
    igHandle: "@robmartinez",
    status: "contacted",
    isLicensed: true,
  },
];

async function main() {
  // Get the first agent user
  const agent = await prisma.user.findFirst({
    where: { role: "agent" },
  });

  if (!agent) {
    // If no agent exists, get any user
    const anyUser = await prisma.user.findFirst();
    if (!anyUser) {
      console.log("No users found. Please create a user first.");
      return;
    }
    console.log(`Using user: ${anyUser.email}`);

    for (const recruit of testRecruits) {
      await prisma.recruit.create({
        data: {
          ...recruit,
          agentId: anyUser.id,
        },
      });
    }
  } else {
    console.log(`Using agent: ${agent.email}`);

    for (const recruit of testRecruits) {
      await prisma.recruit.create({
        data: {
          ...recruit,
          agentId: agent.id,
        },
      });
    }
  }

  console.log(`Created ${testRecruits.length} test licensed recruits!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
