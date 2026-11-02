import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Public paths that do not require auth check
  const publicPaths = ["/", "/login", "/register", "/store", "/roi-calculator"];
  const pathname = request.nextUrl.pathname;

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith("/store/")
  );

  // Allow static files, api routes, next internals
  if (
    isPublic ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
