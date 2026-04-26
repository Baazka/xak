import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const taskId = sp.get("task_id");
  const userId = user.id;
  if (!taskId) {
    return NextResponse.json({ error: "Task ID are required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    const taskCommentRes = await client.query(
      `SELECT 
      c.comment_id,
      c.comment_task_id,
      to_char(c.comment_date, 'YYYY.MM.DD HH24:MI') comment_date,
      c.created_by,
      u.user_firstname,
      u.user_phone,
      u.user_email,
      c.comment_text,
      c.comment_side
      FROM reg_task_comment c 
      join reg_users_new u on c.created_by = u.user_id
      WHERE comment_task_id = $1 and is_active = 1
      order by comment_id desc`,
      [taskId]
    );

    return NextResponse.json(
      {
        taskComment: taskCommentRes.rows,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();
  const userId = user.id;
  const commentTaskId = body.comment_task_id;
  const commentId = body.comment_id;
  const commentText = body.comment_text;
  const commentCreatedBy = body.comment_created_by;
  const commentSide = commentCreatedBy === userId ? 1 : 2;

  if (!commentText) {
    return NextResponse.json({ error: "Comment Text are required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    if (commentId) {
      await client.query(`UPDATE reg_task_comment SET comment_text = $1 WHERE comment_id = $2`, [
        commentText,
        commentId,
      ]);
    } else {
      await client.query(
        `INSERT INTO reg_task_comment (comment_task_id, comment_date, comment_side, comment_text, is_active, created_by) VALUES ($1, current_timestamp, $2, $3, 1, $4)`,
        [commentTaskId, commentSide, commentText, userId]
      );
    }

    return NextResponse.json(
      { message: "Task comment insert/update successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Task Comment insert/update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const DELETE = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();
  const userId = user.id;
  const commentId = body.comment_id;

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID are required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    await client.query(`UPDATE reg_task_comment SET is_active = 0 WHERE comment_id = $1`, [
      commentId,
    ]);

    return NextResponse.json({ message: "Task comment delete successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Task Comment delete error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
