// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRoutes } from "@/app/config/auth";
import { jwtVerify } from "jose";
import { RoleCode } from "@/app/config/roleHome";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const ROUTE_ROLE_MAP: Record<string, RoleCode[]> = {
  "/users": ["ADMIN", "USER"],
  "/dashboard1": ["SUPERADMIN"],
  "/dashboard2": ["ADMIN"],
  "/dashboard3": ["XAKADMIN"],
  "/dashboard4": ["XAKUSER"],
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
    const result = await jwtVerify(token, secret);
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
  const matched = Object.entries(ROUTE_ROLE_MAP).find(([route]) => pathname.startsWith(route));

  if (matched) {
    const [, allowedRoles] = matched;
    if (!allowedRoles.includes(payload.activeRole as RoleCode)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!^/$|api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
