// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

import { publicRoutes } from "@/app/config/auth";
import { getJwtSecret } from "@/lib/jwt";
import { ROUTE_ROLE_MAP, RoleCode } from "@/app/config/roleHome";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Root болон static-уудыг алгасна
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Public route
  const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
  if (isPublic) return NextResponse.next();

  // Token шалгах
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  let payload: any;
  try {
    const result = await jwtVerify(token, getJwtSecret());
    payload = result.payload;
  } catch {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Role check
  const matched = Object.entries(ROUTE_ROLE_MAP).find(
    ([route]) => pathname === route || pathname.startsWith(route + "/")
  );

  if (matched) {
    const [, allowedRoles] = matched;
    const activeRole = payload?.activeRole as RoleCode | undefined;

    if (!activeRole || !allowedRoles.includes(activeRole)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!^/$|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
