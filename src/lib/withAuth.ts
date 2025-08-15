// lib/withAuth.ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookies } from "./auth";

export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const user = await getTokenFromCookies();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // user-г handler-д дамжуулж өгнө
    return handler(req, ...args, user);
  };
}
