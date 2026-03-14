import { NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";

export const PUT = withAuth(async (req, user) => {
  const { username, reg_no, email, phone } = await req.json();

  await db.query(
    `
    UPDATE reg_users_new
    SET user_firstname = $1,
        user_register_no  = $2,
        user_email      = $3,
        user_phone      = $4
    WHERE user_id = $5
    `,
    [username, reg_no, email, phone, user.id]
  );

  return NextResponse.json({ success: true });
});

export const GET = withAuth(async (req, user) => {
  const res = await db.query(
    `
    SELECT 
      USER_FIRSTNAME,
      USER_REGISTER_NO,
      USER_PHONE,
      USER_EMAIL
    FROM REG_USERS_NEW
    WHERE USER_ID = $1
    `,
    [user.id]
  );

  return NextResponse.json({ success: true, data: res.rows });
});
