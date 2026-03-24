import { NextResponse } from "next/server";

export function requireAdminToken(request: Request) {
  const configuredToken = process.env.ADMIN_TOKEN;
  if (!configuredToken) {
    return NextResponse.json(
      { message: "ADMIN_TOKEN is not configured on server." },
      { status: 500 },
    );
  }

  const token = request.headers.get("x-admin-token");
  if (!token || token !== configuredToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}
