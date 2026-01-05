import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { publicRoutes, authCookieName } from "@/app/config/auth";

interface JWTPayload {
  exp: number;
  sub: string;
  role?: string;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(authCookieName)?.value;

  // 1. Root
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = token ? "/ecommerce" : "/signin";
    return NextResponse.redirect(url);
  }

  // 2. Static
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // 3. API
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // 4. Public routes
  if (publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.next();
  }

  // 5. No token
  if (!token) return redirectToSignin(req);

  // 6. Verify JWT 
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
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
