import fs from "node:fs/promises";
import path from "node:path";

const backupFile = process.argv[2];
if (!backupFile) {
  console.error("Usage: node scripts/restore-db.mjs <backup-file-path>");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
if (!databaseUrl.startsWith("file:")) {
  console.error("Only file-based SQLite is supported by this restore script.");
  process.exit(1);
}

const dbPath = path.resolve(process.cwd(), databaseUrl.slice("file:".length));
const backupPath = path.resolve(process.cwd(), backupFile);
await fs.copyFile(backupPath, dbPath);
console.log(`Database restored from: ${backupPath}`);
