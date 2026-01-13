// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JwtPayload } from "@/lib/jwtPayload";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const { payload } = await jwtVerify<JwtPayload>(token, secret);
    return NextResponse.json({
      user: payload,
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
