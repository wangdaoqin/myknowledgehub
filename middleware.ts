import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/friends") && pathname !== "/friends/login") {
    const hasAccess = request.cookies.get("kh_friend_access")?.value === "1";
    if (!hasAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/friends/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/friends/:path*"],
};
