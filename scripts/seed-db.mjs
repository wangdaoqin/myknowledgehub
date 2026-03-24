import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.resolve(process.cwd(), "data/resources.json");
  const raw = await fs.readFile(jsonPath, "utf8");
  const resources = JSON.parse(raw);

  await prisma.resource.deleteMany();
  if (resources.length > 0) {
    await prisma.resource.createMany({
      data: resources.map((item) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags.join("|") : "",
      })),
    });
  }

  console.log(`Seeded ${resources.length} resources into SQLite.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
