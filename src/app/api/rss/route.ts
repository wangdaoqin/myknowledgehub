import { NextResponse } from "next/server";
import { fetchFeeds } from "@/lib/rss";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await fetchFeeds(20);
  return NextResponse.json({ total: items.length, items });
}
