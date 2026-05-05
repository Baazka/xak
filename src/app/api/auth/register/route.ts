// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const POST = async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    org_register_no,
    org_legal_name,
    org_phone,
    org_email,
    org_address,
    org_head_name,
    org_head_phone,
    org_head_email,
  } = body;

  // ---------- validation ----------
  if (!org_legal_name || !org_register_no || !org_email) {
    return NextResponse.json({ message: "Нэр болон регистр заавал" }, { status: 400 });
  }

  // ---------- uniqueness check ----------
  const exists = await db.query(
    "SELECT 1 FROM reg_aud_org WHERE UPPER(org_register_no) = $1 AND org_status = 'ACTIVE'",
    [org_register_no.trim().toUpperCase()]
  );

  if (exists.rows.length > 0) {
    return NextResponse.json({ message: "ХАК бүртгэлтэй байна." }, { status: 409 });
  }

  // ---------- insert ----------
  const result = await db.query(
    `
      INSERT INTO reg_aud_org
        (ORG_REGISTER_NO, ORG_LEGAL_NAME, ORG_PHONE, ORG_EMAIL, ORG_ADDRESS, ORG_HEAD_NAME, ORG_HEAD_PHONE, ORG_HEAD_EMAIL, CREATED_BY, CREATED_DATE, ORG_STATUS)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, current_timestamp, 'PENDING')
      RETURNING *
      `,
    [
      org_register_no.trim(),
      org_legal_name.trim(),
      org_phone,
      org_email.trim(),
      org_address,
      org_head_name,
      org_head_phone,
      org_head_email,
      999,
    ]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
};
