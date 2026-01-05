import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cookies } from "next/headers";
const bcrypt = require("bcryptjs");

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;

  if (refresh) {
    const { rows } = await db.query("SELECT id, refresh_token_hash FROM reg_user_sessions");
    for (const r of rows) {
      if (bcrypt.compareSync(refresh, r.refresh_token_hash)) {
        await db.query("DELETE FROM reg_user_sessions WHERE id=$1", [r.id]);
        break;
      }
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
  return res;
}
