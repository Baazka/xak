import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { JwtPayload } from "@/lib/jwtPayload";
import { getJwtSecret } from "@/lib/jwt";

type Handler<TParams = undefined> = TParams extends undefined
  ? (req: NextRequest, user: JwtPayload) => Promise<NextResponse>
  : (
      req: NextRequest,
      user: JwtPayload,
      context: { params: Promise<TParams> }
    ) => Promise<NextResponse>;

export function withAuth<TParams = undefined>(handler: Handler<TParams>) {
  return async function (req: NextRequest, context?: { params: Promise<TParams> }) {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify<JwtPayload>(token, getJwtSecret());

      if (context) {
        return (handler as any)(req, payload, context);
      }

      return (handler as any)(req, payload);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  };
}
