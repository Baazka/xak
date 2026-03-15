// src/app/api/users/meta/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const userRole = await db.query(
      `
        SELECT 
            role_id, 
            role_label,
            role_code,
            role_text
        FROM ref_user_role
        WHERE role_level = 2
        ORDER BY role_id
      `
    );

    return NextResponse.json({
      userRole: userRole.rows,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load users metadata" }, { status: 500 });
  }
}
