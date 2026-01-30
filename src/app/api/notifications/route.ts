// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

/* ======================================================
   GET /api/notifications
   Query:
   ?page=1&limit=10&unread=true
   ====================================================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const offset = (page - 1) * limit;

    const unread = searchParams.get("unread") === "true" ? true : null;

    const result = await db.query(
      `
      WITH filtered AS (
        SELECT
          n.id,
          n.title,
          n.message,
          n.reference,
          n.is_read,
          n.created_at
        FROM notifications n
        WHERE
          ($1::boolean IS NULL OR n.is_read = false)
      ),
      metrics AS (
        SELECT
          COUNT(*) AS total_count,
          COUNT(*) FILTER (WHERE is_read = false) AS unread_count
        FROM filtered
      )
      SELECT
        json_agg(
          json_build_object(
            'id', f.id,
            'title', f.title,
            'message', f.message,
            'reference', f.reference,
            'is_read', f.is_read,
            'created_at', f.created_at
          )
          ORDER BY f.created_at DESC
        ) AS notifications,
        (SELECT row_to_json(metrics) FROM metrics) AS metrics
      FROM (
        SELECT *
        FROM filtered
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      ) f;
      `,
      [unread, limit, offset]
    );

    const row = result.rows[0];

    return NextResponse.json({
      data: row?.notifications ?? [],
      metrics: row?.metrics ?? {
        total_count: 0,
        unread_count: 0,
      },
    });
  } catch (err: any) {
    console.error("❌ GET /api/notifications error:", err);
    return NextResponse.json(
      { message: "Failed to load notifications", detail: err.message },
      { status: 500 }
    );
  }
}

/* ======================================================
   PATCH /api/notifications
   Body:
   { "ids": ["uuid1", "uuid2"] }
   or
   { "mark_all": true }
   ====================================================== */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ids, mark_all } = body;

    if (!mark_all && (!ids || !Array.isArray(ids) || ids.length === 0)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    if (mark_all) {
      await db.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE is_read = false
        `
      );
    } else {
      await db.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE id = ANY($1::uuid[])
        `,
        [ids]
      );
    }

    return NextResponse.json({
      message: "Notifications marked as read",
    });
  } catch (err: any) {
    console.error("❌ PATCH /api/notifications error:", err);
    return NextResponse.json(
      { message: "Failed to update notifications", detail: err.message },
      { status: 500 }
    );
  }
}
