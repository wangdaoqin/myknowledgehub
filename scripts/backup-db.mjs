import fs from "node:fs/promises";
import path from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const prefix = "file:";
if (!databaseUrl.startsWith(prefix)) {
  console.error("Only file-based SQLite is supported by this backup script.");
  process.exit(1);
}

const dbRelativePath = databaseUrl.slice(prefix.length);
const dbPath = path.resolve(process.cwd(), dbRelativePath);
const backupDir = path.resolve(process.cwd(), "backups");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.join(backupDir, `knowledgehub-${stamp}.db`);

await fs.mkdir(backupDir, { recursive: true });
await fs.copyFile(dbPath, backupPath);
console.log(`Database backup created: ${backupPath}`);
