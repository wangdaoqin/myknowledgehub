import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { writeResourcesToFile } from "@/lib/resource-store";
import { prisma } from "@/lib/prisma";
import { hitRateLimit } from "@/lib/rate-limit";
import type { CategorySlug, ResourceItem } from "@/types/resource";

export const runtime = "nodejs";

type NewResourcePayload = Omit<ResourceItem, "id"> & { id?: string };

const validCategories = new Set<CategorySlug>([
  "programming",
  "statistics",
  "ai",
  "accounting",
]);

const validStages = new Set(["beginner", "intermediate", "advanced"]);
const MAX_TEXT = 500;

function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function assertSafeText(value: string, field: string) {
  if (value.length > MAX_TEXT) {
    throw new Error(`${field} is too long`);
  }
}

function normalize(payload: NewResourcePayload): ResourceItem {
  const title = payload.title?.trim();
  const url = payload.url?.trim();
  const category = payload.category;
  const stage = payload.stage;

  if (!title || !url) {
    throw new Error("title and url are required");
  }
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("url must start with http:// or https://");
  }
  if (!validCategories.has(category)) {
    throw new Error("invalid category");
  }
  if (!validStages.has(stage)) {
    throw new Error("invalid stage");
  }

  const id =
    payload.id?.trim() ||
    `${category}-${title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;

  assertSafeText(title, "title");
  assertSafeText(payload.description?.trim() ?? "", "description");
  assertSafeText(payload.subcategory?.trim() ?? "", "subcategory");
  assertSafeText(payload.scenario?.trim() ?? "", "scenario");
  assertSafeText(payload.icon?.trim() ?? "", "icon");
  assertSafeText(payload.rating?.trim() ?? "", "rating");

  const recommendedScore = Number(payload.recommendedScore ?? 3);
  if (!Number.isFinite(recommendedScore) || recommendedScore < 1 || recommendedScore > 5) {
    throw new Error("recommendedScore must be between 1 and 5");
  }

  const lastVerifiedAt = payload.lastVerifiedAt?.trim() || new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastVerifiedAt)) {
    throw new Error("lastVerifiedAt must be YYYY-MM-DD");
  }

  const tags = (payload.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
  if (tags.length > 20) {
    throw new Error("too many tags");
  }

  return {
    id,
    title,
    url,
    description: payload.description?.trim() ?? "",
    category,
    subcategory: payload.subcategory?.trim() ?? "general",
    stage,
    scenario: payload.scenario?.trim() ?? "general",
    tags,
    icon: payload.icon?.trim() || "/globe.svg",
    rating: payload.rating?.trim() || "★★★☆☆",
    recommendedScore,
    lastVerifiedAt,
    isFeatured: Boolean(payload.isFeatured),
  };
}

function toDbPayload(resource: ResourceItem) {
  return {
    ...resource,
    tags: resource.tags.join("|"),
  };
}

function fromDbRow(row: {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  subcategory: string;
  stage: string;
  scenario: string;
  tags: string;
  icon: string;
  rating: string;
  recommendedScore: number;
  lastVerifiedAt: string;
  isFeatured: boolean;
}): ResourceItem {
  return {
    ...row,
    category: row.category as CategorySlug,
    stage: row.stage as ResourceItem["stage"],
    tags: row.tags ? row.tags.split("|").filter(Boolean) : [],
  };
}

async function mirrorDbToJson() {
  const rows = await prisma.resource.findMany();
  const items = rows.map(fromDbRow);
  await writeResourcesToFile(items);
}

async function createAuditLog(action: string, resourceId: string, detail: string) {
  await prisma.adminAuditLog.create({
    data: { action, resourceId, detail },
  });
}

export async function GET(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const rows = await prisma.resource.findMany();
  return NextResponse.json({
    total: rows.length,
    items: rows.map(fromDbRow),
  });
}

export async function POST(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  if (hitRateLimit(`admin-post:${getClientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  try {
    const payload = (await request.json()) as NewResourcePayload;
    const newItem = normalize(payload);
    await prisma.resource.create({ data: toDbPayload(newItem) });
    await createAuditLog("create", newItem.id, `${newItem.title} (${newItem.category})`);
    await mirrorDbToJson();
    return NextResponse.json({ message: "created", item: newItem });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "id already exists"
        : error instanceof Error
          ? error.message
          : "invalid request";
    return NextResponse.json(
      { message },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  if (hitRateLimit(`admin-put:${getClientIp(request)}`, 40, 60_000)) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  try {
    const payload = (await request.json()) as NewResourcePayload & { id: string };
    if (!payload.id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    const existing = await prisma.resource.findUnique({ where: { id: payload.id } });
    if (!existing) {
      return NextResponse.json({ message: "resource not found" }, { status: 404 });
    }

    const merged = normalize({
      ...fromDbRow(existing),
      ...payload,
      id: payload.id,
    });
    await prisma.resource.update({
      where: { id: payload.id },
      data: toDbPayload(merged),
    });
    await createAuditLog("update", merged.id, `${merged.title} (${merged.category})`);
    await mirrorDbToJson();
    return NextResponse.json({ message: "updated", item: merged });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "invalid request" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  if (hitRateLimit(`admin-delete:${getClientIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "id is required" }, { status: 400 });
  }

  const existing = await prisma.resource.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "resource not found" }, { status: 404 });
  }

  await prisma.resource.delete({ where: { id } });
  await createAuditLog("delete", id, `deleted by admin`);
  await mirrorDbToJson();
  return NextResponse.json({ message: "deleted", id });
}
