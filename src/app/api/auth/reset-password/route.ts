import crypto from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
    const hash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await db.query(
      `
    SELECT user_id FROM reg_users_new
    WHERE reset_token=$1
      AND reset_token_date > NOW()
    `,
      [token]
    );

    if (!user.rowCount) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `
    UPDATE reg_users_new
    SET user_password=$1,
        reset_token =NULL,
        reset_token_date=NULL,
        user_status_id = 1,
        user_otp = NULL,
        pending_token_hash = NULL,
        pending_token_expire = NULL,
        reset_token_hash = NULL,
        reset_token_expire = NULL
    WHERE user_id=$2
    `,
      [hashedPassword, user.rows[0].user_id]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
