import { NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const PUT = withAuth(async (req, user) => {
  const { firstname, lastname, email, phone } = await req.json();

  await db.query(
    `
    UPDATE reg_users
    SET firstname = $1,
        lastname  = $2,
        email      = $3,
        phone      = $4
    WHERE id = $5
    `,
    [firstname, lastname, email, phone, user.id]
  );

  return NextResponse.json({ success: true });
});
