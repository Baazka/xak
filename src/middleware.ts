// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRoutes } from "@/app/config/auth";
import { getJwtSecret } from "@/lib/jwt";
import { jwtVerify } from "jose";
import { RoleCode } from "@/app/config/roleHome";

const ROUTE_ROLE_MAP: Record<string, RoleCode[]> = {
  "/users": ["GOD"],
  "/dashboard1": ["ADMIN"],
  "/dashboard2": ["HELPDESK"],
  "/dashboard3": ["SUPERUSER"],
  "/dashboard4": ["USER"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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

  if (pathname === "/select-role") {
    if (!payload?.roles || payload.roles.length === 0) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  // Active role шалгах
  const matched = Object.entries(ROUTE_ROLE_MAP).find(
    ([route]) => pathname === route || pathname.startsWith(route + "/")
  );

  if (matched) {
    const [, allowedRoles] = matched;

    // activeRole байхгүй бол сонгуул
    if (!payload?.activeRole) {
      return NextResponse.redirect(new URL("/select-role", req.url));
    }

    // зөвшөөрөгдөөгүй бол
    if (!allowedRoles.includes(payload.activeRole as RoleCode)) {
      // хэрвээ өөр зөв role-той бол (403 биш)
      const hasAnyAllowed = Array.isArray(payload.roles)
        ? payload.roles.some((r: string) => allowedRoles.includes(r as RoleCode))
        : false;

      return NextResponse.redirect(new URL(hasAnyAllowed ? "/select-role" : "/403", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!^/$|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
