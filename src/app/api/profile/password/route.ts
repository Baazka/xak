import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const PUT = withAuth(async (req, user) => {
  const { currentPassword, newPassword } = await req.json();

  const result = await db.query("SELECT password FROM reg_users WHERE id = $1", [user.sub]);

  const valid = await bcrypt.compare(currentPassword, result.rows[0].password);

  if (!valid) {
    return NextResponse.json({ error: "Одоогийн нууц үг буруу байна" }, { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await db.query("UPDATE reg_users SET password = $1 WHERE id = $2", [hash, user.sub]);

  return NextResponse.json({ success: true });
});
