// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { JwtPayload } from "@/lib/jwtPayload";
import { getJwtSecret } from "@/lib/jwt";

export async function GET() {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const { payload } = await jwtVerify<JwtPayload>(token, getJwtSecret());
    return NextResponse.json({ user: payload }, { status: 200 });
  } catch {
    // token эвдэрсэн ч UI талдаа logged out гэж л үзье
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
