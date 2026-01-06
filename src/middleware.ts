// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRoutes } from "@/app/config/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;

  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (isPublic) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!^/$|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
