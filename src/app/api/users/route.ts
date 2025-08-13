import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // make sure this exports a connected pg client

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const offset = (page - 1) * pageSize;

  try {
    // Get total count for pagination metadata
    const countResult = await db.query(
      "SELECT COUNT(*) FROM users WHERE status is null"
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated users
    const result = await db.query(
      "SELECT * FROM users WHERE status is null ORDER BY id LIMIT $1 OFFSET $2",
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
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "create";

    switch (action) {
      case "create":
        return await createUser(body.data);

      case "update":
        return await updateUser(body.data);

      case "remove":
        return await removeUser(body.data);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
async function createUser({ name, email }: { name: string; email: string }) {
  try {
    const result = await db.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
async function updateUser({
  id,
  name,
  email,
}: {
  id: number;
  name: string;
  email: string;
}) {
  try {
    const result = await db.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
async function removeUser(id: number) {
  try {
    const result = await db.query(
      "UPDATE users SET status = 1 WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
