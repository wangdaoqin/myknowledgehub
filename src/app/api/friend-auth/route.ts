import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { code?: string };
  const expectedCode = process.env.FRIEND_ACCESS_CODE;
  if (!expectedCode) {
    return NextResponse.json(
      { message: "FRIEND_ACCESS_CODE is not configured on server." },
      { status: 500 },
    );
  }

  if (!body.code || body.code !== expectedCode) {
    return NextResponse.json({ message: "Invalid access code." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("kh_friend_access", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
