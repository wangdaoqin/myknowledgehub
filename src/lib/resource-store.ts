import fs from "node:fs/promises";
import path from "node:path";
import type { ResourceItem } from "@/types/resource";

const RESOURCES_JSON_PATH = path.join(process.cwd(), "data", "resources.json");

export async function readResourcesFromFile(): Promise<ResourceItem[]> {
  const raw = await fs.readFile(RESOURCES_JSON_PATH, "utf8");
  return JSON.parse(raw) as ResourceItem[];
}

export async function writeResourcesToFile(resources: ResourceItem[]) {
  await fs.writeFile(RESOURCES_JSON_PATH, `${JSON.stringify(resources, null, 2)}\n`, "utf8");
}
