import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const agency = await prisma.agency.upsert({
    where: { slug: "pipeline-activation-system" },
    update: {},
    create: {
      name: "Pipeline Activation System Agency",
      slug: "pipeline-activation-system",
      primaryColor: "#6366f1",
    },
  });

  const hashedPassword = await bcrypt.hash("I@mthed0n", 12);
  await prisma.user.upsert({
    where: { email: "ojo.kayode.o@gmail.com" },
    update: {},
    create: {
      email: "ojo.kayode.o@gmail.com",
      name: "Kay",
      password: hashedPassword,
      role: "AGENCY_ADMIN",
      agencyId: agency.id,
    },
  });

  await prisma.onboardingForm.upsert({
    where: { id: "default-form-001" },
    update: {},
    create: {
      id: "default-form-001",
      agencyId: agency.id,
      name: "Standard Onboarding Form",
      description: "Comprehensive onboarding questionnaire",
      sections: JSON.stringify([]),
      isDefault: true,
      isActive: true,
    },
  });

  console.log("Seed complete. Login: ojo.kayode.o@gmail.com");
}

main().catch(console.error).finally(() => prisma.$disconnect());
