// src/app/api/notifications/meta/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [notiTypeResult, targetTypeResult] = await Promise.all([
      db.query(`
        SELECT type_id, type_name, type_description
        FROM public.sys_noti_type
        ORDER BY type_id
      `),
      db.query(`
        SELECT type_id, type_name, type_code
        FROM public.sys_target_type
        ORDER BY type_id
      `),
    ]);

    return NextResponse.json({
      notificationTypes: notiTypeResult.rows,
      targetTypes: targetTypeResult.rows,
    });
  } catch (error) {
    console.error("GET /api/notifications/meta error:", error);
    return NextResponse.json({ error: "Failed to load notification metadata" }, { status: 500 });
  }
}
