import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { publicRoutes, authCookieName } from "@/app/config/auth";

interface JWTPayload {
  exp: number;
  sub: string;
  role?: string;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(authCookieName)?.value;
  console.log("MIDDLEWARE HIT:", pathname);
  // ⭐ 1. ROOT "/" – хамгийн эхэнд
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = token ? "/ecommerce" : "/signin";
    return NextResponse.redirect(url);
  }

  // 2. Static / assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // 3. API
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // 4. Public routes (⚠️ "/" энд байх ёсгүй)
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // 5. No token
  if (!token) {
    return redirectToSignin(req);
  }

  // 6. Decode + exp
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
  matcher: ["/", "/(.*)"],
};
