import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt";
import type { JwtPayload } from "@/lib/jwtPayload";

type RouteContext<TParams> = {
  params: Promise<TParams>;
};

type AuthedHandler<TParams> = (
  req: NextRequest,
  user: JwtPayload,
  context: RouteContext<TParams>
) => Promise<Response>;

export function withAuth<TParams>(handler: AuthedHandler<TParams>) {
  return async function routeHandler(
    req: NextRequest,
    context: RouteContext<TParams>
  ): Promise<Response> {
    try {
      const token = req.cookies.get("access_token")?.value;

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { payload } = await jwtVerify(token, getJwtSecret());

      return handler(req, payload as unknown as JwtPayload, context);
    } catch (err) {
      console.error("Auth error:", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  };
}
