import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const target = path.resolve(process.cwd(), "data/resources.json");
  const rows = await prisma.resource.findMany();
  const items = rows.map((row) => ({
    ...row,
    tags: row.tags ? row.tags.split("|").filter(Boolean) : [],
  }));
  await fs.writeFile(target, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  console.log(`Synced ${items.length} resources from SQLite to JSON.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
