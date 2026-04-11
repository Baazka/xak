import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const formId = sp.get("form_id");
  const userId = user.id;
  if (!formId) {
    return NextResponse.json({ error: "Form ID are required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    const formCommentRes = await client.query(
      `SELECT 
      c.comment_id,
      c.comment_form_id,
      to_char(c.comment_date, 'YYYY.MM.DD') comment_date,
      c.comment_by,
      u.user_firstname,
      u.user_phone,
      u.user_email,
      c.comment_text
      FROM audit_form_comments c 
      join reg_users_new u on c.comment_by = u.user_id
      WHERE comment_form_id = $1 and is_active = 1
      order by comment_date desc`,
      [formId]
    );

    return NextResponse.json(
      {
        formComment: formCommentRes.rows,
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
  const formId = body.form_id;
  const commentId = body.comment_id;
  const commentText = body.comment_text;

  if (!formId || !commentText) {
    return NextResponse.json({ error: "Form ID and Comment Text are required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    if (commentId) {
      await client.query(`UPDATE audit_form_comments SET comment_text = $1 WHERE comment_id = $2`, [
        commentText,
        commentId,
      ]);
    } else {
      await client.query(
        `INSERT INTO audit_form_comments (comment_form_id, comment_date, comment_by, comment_text, is_active) VALUES ($1, current_timestamp, $2, $3, 1)`,
        [formId, userId, commentText]
      );
    }

    return NextResponse.json(
      { message: "Form comment insert/update successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Form Comment insert/update error:", err);

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
    await client.query(`UPDATE audit_form_comments SET is_active = 0 WHERE comment_id = $1`, [
      commentId,
    ]);

    return NextResponse.json({ message: "Form comment delete successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Form Comment delete error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
