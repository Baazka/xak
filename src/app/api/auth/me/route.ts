import { NextResponse } from "next/server";
import { getTokenFromCookies } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  const payload = await getTokenFromCookies();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await db.query(
    "SELECT id, email, name FROM users WHERE id=$1",
    [payload.id]
  );

  return NextResponse.json(rows[0]);
}
