import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { publicRoutes, authCookieName } from "./config/auth";

interface JWTPayload {
  exp: number;
  sub: string;
  role?: string;
}

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
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // 4. Token байхгүй бол login руу redirect
  if (!token) {
    return redirectToSignin(req);
  }

  // 5. Token буруу бол login руу redirect
  try {
    const decoded = jwtDecode<JWTPayload>(token);

    if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
      return redirectToSignin(req);
    }

    return NextResponse.next();
  } catch {
    return redirectToSignin(req);
  }
}
function redirectToSignin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/signin";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};
