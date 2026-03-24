import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
  const action = searchParams.get("action");
  const query = searchParams.get("q")?.trim();
  const format = searchParams.get("format");

  const where = {
    ...(action && action !== "all" ? { action } : {}),
    ...(query
      ? {
          OR: [
            { resourceId: { contains: query } },
            { detail: { contains: query } },
          ],
        }
      : {}),
  };

  const [total, logs] = await Promise.all([
    prisma.adminAuditLog.count({ where }),
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  if (format === "csv") {
    const csvHeader = "id,action,resourceId,detail,createdAt";
    const escape = (value: string | number) => {
      const text = String(value ?? "");
      if (text.includes(",") || text.includes('"') || text.includes("\n")) {
        return `"${text.replaceAll('"', '""')}"`;
      }
      return text;
    };
    const rows = logs.map((log) =>
      [log.id, log.action, log.resourceId, log.detail, log.createdAt.toISOString()]
        .map(escape)
        .join(","),
    );
    const body = `${csvHeader}\n${rows.join("\n")}\n`;
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"admin-audit-log.csv\"",
      },
    });
  }

  return NextResponse.json({
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    items: logs,
  });
}
