import fs from "node:fs/promises";
import path from "node:path";

const sourceJsonPath = path.resolve(process.cwd(), "data/resources.json");
const targetCsvPath = path.resolve(process.cwd(), "data/resources.csv");

const headers = [
  "id",
  "title",
  "url",
  "description",
  "category",
  "subcategory",
  "stage",
  "scenario",
  "tags",
  "icon",
  "rating",
  "recommendedScore",
  "lastVerifiedAt",
  "isFeatured",
];

function escapeCsvCell(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

async function main() {
  const raw = await fs.readFile(sourceJsonPath, "utf8");
  const items = JSON.parse(raw);
  const rows = [
    headers.join(","),
    ...items.map((item) =>
      headers
        .map((key) => {
          const value = key === "tags" ? item.tags.join("|") : item[key];
          return escapeCsvCell(value);
        })
        .join(","),
    ),
  ];

  await fs.writeFile(targetCsvPath, `${rows.join("\n")}\n`, "utf8");
  console.log(`Exported ${items.length} resources to data/resources.csv`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
