import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ user: null });
  }
}
