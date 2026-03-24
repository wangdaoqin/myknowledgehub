import fs from "node:fs/promises";
import path from "node:path";

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-csv.mjs <csv-file-path>");
  process.exit(1);
}

const absoluteCsvPath = path.resolve(process.cwd(), csvPath);
const targetJsonPath = path.resolve(process.cwd(), "data/resources.json");

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

async function main() {
  const csv = await fs.readFile(absoluteCsvPath, "utf8");
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV must include header and at least one data row.");
  }

  const headers = parseCsvLine(lines[0]);
  const items = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((key, index) => [key, values[index] ?? ""]));

    return {
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description,
      category: row.category,
      subcategory: row.subcategory,
      stage: row.stage,
      scenario: row.scenario,
      tags: row.tags ? row.tags.split("|").map((tag) => tag.trim()) : [],
      icon: row.icon,
      rating: row.rating,
      recommendedScore: Number(row.recommendedScore || 0),
      lastVerifiedAt: row.lastVerifiedAt,
      isFeatured: row.isFeatured === "true",
    };
  });

  await fs.writeFile(targetJsonPath, JSON.stringify(items, null, 2), "utf8");
  console.log(`Imported ${items.length} resources to data/resources.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
