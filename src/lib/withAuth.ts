import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JwtPayload } from "@/lib/jwtPayload";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

type Handler = (req: NextRequest, user: JwtPayload) => Promise<NextResponse>;

export function withAuth(handler: Handler) {
  return async function (req: NextRequest) {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify<JwtPayload>(token, secret);
      return handler(req, payload);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  };
}
