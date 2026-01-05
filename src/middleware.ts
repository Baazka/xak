import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRoutes } from "@/app/config/auth";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // 1. Root
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = refreshToken ? "/ecommerce" : "/signin";
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

  // 5. Token байхгүй бол л redirect
  if (!refreshToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // ✅ token байвал expire эсэхийг шалгахгүй
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/((?!_next|favicon.ico).*)"],
};
