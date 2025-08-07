import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // make sure this exports a connected pg client

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const offset = (page - 1) * pageSize;

  try {
    // Get total count for pagination metadata
    const countResult = await db.query("SELECT COUNT(*) FROM users");
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated users
    const result = await db.query(
      "SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2",
      [pageSize, offset]
    );

    return NextResponse.json({
      data: result.rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
