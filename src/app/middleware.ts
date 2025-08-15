import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { publicRoutes, authCookieName } from "./config/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(authCookieName)?.value;

  // 1. Static болон asset файлуудыг алгасах
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // 2. API route бол алгасах
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // 3. Public route бол алгасах
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    return NextResponse.next();
  }

  // 4. Token байхгүй бол login руу redirect
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/signin";
    return NextResponse.redirect(loginUrl);
  }

  // 5. Token буруу бол login руу redirect
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/signin";
    return NextResponse.redirect(loginUrl);
  }

  // 6. Token зөв бол үргэлжлүүлэх
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
