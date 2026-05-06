import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const auditId = sp.get("aud_id");
  const formListId = sp.get("formlist_id");
  const userId = user.id;

  if (!auditId || !formListId) {
    return NextResponse.json({ error: "Audit ID and Form List ID are required" }, { status: 400 });
  }

  const client = await db.connect();

  try {
    const formDataRes = await client.query(
      `
      SELECT 
        f.form_id,
        f.form_aud_id,
        f.form_list_id,
        af.form_stage,
        af.form_name,
        af.form_code,
        f.form_status_id,
        s.status_label AS form_status_name,
        s.status_code AS from_status_code,
        f.form_description,
        f.form_sup_value,
        f.form_file_id
      FROM audit_forms f
      JOIN ref_audit_form af ON f.form_list_id = af.form_id
      JOIN ref_form_status s ON f.form_status_id = s.status_id
      WHERE f.form_aud_id = $1 AND f.form_list_id = $2
      `,
      [auditId, formListId]
    );

    if (!formDataRes.rows[0]) {
      return NextResponse.json({ error: "Form data not found" }, { status: 404 });
    }

    return NextResponse.json({ formData: formDataRes.rows[0] }, { status: 200 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
