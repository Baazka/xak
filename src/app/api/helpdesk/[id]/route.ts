import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (_req: NextRequest, user: JwtPayload, ctx: any) => {
  const { id } = await ctx.params;
  const taskId = Number(id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    const result = await client.query(
      `
      select 
        task_id,
        task_org_id,
        ao.org_legal_name,
        rur.role_text user_role_name,
        u.user_firstname,
        u.user_email,
        u.user_phone,
        task_code,
        to_char(task_date,'YYYY.MM.DD HH24:MI') task_date,
        task_status_id,
        ts.status_label task_status_name,
        task_priority_id,
        tp.priority_name task_priority_name,
        t.task_title,
        t.task_content,
        t.task_audit_id,
        t.task_form_id,
        t.task_created_by
        from reg_task t
        join reg_aud_org ao on t.task_org_id = ao.org_id
        join reg_users_new u on t.task_created_by = u.user_id
        join reg_user_roles_new ur on u.user_id = ur.user_id and ur.is_active = 1
        join ref_user_role rur on ur.role_id = rur.role_id
        join ref_task_status ts on t.task_status_id = ts.status_id
        join ref_task_priority tp on t.task_priority_id = tp.priority_id
        where t.task_id = $1
    `,
      [taskId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 200 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  const body = (await req.json().catch(() => null)) as {
    task_id: number;
    task_status_id: number;
  };

  if (!body) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const taskId = body.task_id;
  const statusId = body.task_status_id;

  const client = await db.connect();

  try {
    await client.query("BEGIN");
    // UPDATE reg_task
    await client.query(
      `
        UPDATE reg_task
        set task_status_id = $1, task_updated_by = $2, task_updated_date = current_timestamp
        where task_id = $3
      `,
      [statusId, user.id, taskId]
    );
    // INSERT log_task_status
    await client.query(
      `INSERT INTO log_task_status (task_id, task_status_id, action_by, action_date) VALUES ($1, $2, $3, current_timestamp)`,
      [taskId, statusId, user.id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ message: "Reg Task updated successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Reg Task update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
