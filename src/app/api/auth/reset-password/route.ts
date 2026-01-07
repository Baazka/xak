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
    SELECT id FROM reg_users
    WHERE reset_token_hash=$1
      AND reset_token_exp > NOW()
    `,
      [hash]
    );

    if (!user.rowCount) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `
    UPDATE reg_users
    SET password=$1,
        reset_token_hash=NULL,
        reset_token_exp=NULL
    WHERE id=$2
    `,
      [hashedPassword, user.rows[0].id]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
