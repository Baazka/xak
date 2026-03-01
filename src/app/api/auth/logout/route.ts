import { NextResponse } from "next/server";
import db from "@/lib/db";
import { cookies } from "next/headers";
const bcrypt = require("bcryptjs");

export async function POST() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;

  if (refresh) {
    const [selector, verifier] = refresh.split(".");

    // refresh token format эвдэрсэн бол шууд cookie-г цэвэрлээд дуусгана
    if (selector && verifier) {
      const { rows } = await db.query(
        `
        SELECT id, refresh_token_hash
        FROM reg_user_sessions
        WHERE refresh_selector = $1
        `,
        [selector]
      );

      const session = rows[0];

      if (session) {
        const ok = await bcrypt.compare(verifier, session.refresh_token_hash);
        if (ok) {
          await db.query("DELETE FROM reg_user_sessions WHERE id = $1", [session.id]);
        } else {
          // optional: token зөрсөн бол selector-той бүх session-ийг устгаж болно
          // await db.query("DELETE FROM reg_user_sessions WHERE refresh_selector = $1", [selector]);
        }
      }
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
  return res;
}
