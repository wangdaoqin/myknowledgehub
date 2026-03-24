import { NextResponse } from "next/server";
import { getAllResources } from "@/lib/resources";

export async function GET(request: Request) {
  const allResources = await getAllResources();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const tag = searchParams.get("tag");
  const category = searchParams.get("category");

  const filtered = allResources.filter((item) => {
    const matchesKeyword =
      q.length === 0
        ? true
        : `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(q);
    const matchesTag = tag ? item.tags.includes(tag) : true;
    const matchesCategory = category ? item.category === category : true;
    return matchesKeyword && matchesTag && matchesCategory;
  });

  return NextResponse.json({
    total: filtered.length,
    items: filtered,
  });
}
