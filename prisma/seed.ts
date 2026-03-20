// Optional: add seed data if needed. Run with: npx tsx prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Database seeded (no seed data needed)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
