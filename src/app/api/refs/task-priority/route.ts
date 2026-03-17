// src/app/api/refs/task-priority/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const taskPriority = await db.query(
      `
        SELECT 
            priority_id,
            priority_name
        FROM ref_task_priority
        ORDER BY priority_id
      `
    );

    return NextResponse.json({
      taskPriority: taskPriority.rows,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load taskPriority metadata" }, { status: 500 });
  }
}
