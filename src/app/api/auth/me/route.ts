import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));

    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
