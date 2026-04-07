import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const userId = user.id;
  const sp = new URL(req.url).searchParams;
  const audId = sp.get("aud_id");
  const riskSourceId = sp.get("risk_source_id");
  if (!audId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }
  const sourceFilter = "";
  if (riskSourceId) {
    const sourceFilter = +` AND risk_source_id = ${riskSourceId}`;
  }

  const client = await db.connect();
  try {
    const dataRes = await client.query(
      `
      select 
        risk_id,
        risk_aud_id,
        risk_source_id,
        rs.source_name risk_source_name,
        to_char(risk_date,'YYYY.MM.DD') risk_date,
        risk_status_id,
        st.status_label risk_status_name,
        risk_type_id,
        rt.type_label risk_type_name,
        risk_group_id,
        rg.group_label risk_group_name,
        risk_sub_group_id,
        rsg.sub_group_label risk_sub_group_name,
        risk_cd_type_id,
        rcd.cd_type_label risk_cd_type_name,
        risk_content
        from audit_risks r
        join ref_risk_source rs on r.risk_source_id = rs.source_id
        join ref_risk_status st on r.risk_status_id = st.status_id
        join ref_risk_type rt on r.risk_type_id = rt.type_id
        join ref_risk_group rg on r.risk_group_id = rg.group_id
        join ref_risk_sub_group rsg on r.risk_sub_group_id = rsg.sub_group_id
        join ref_risk_cd_type rcd on r.risk_cd_type_id = rcd.cd_type_id
        where r.risk_aud_id = $1 ${sourceFilter}
    `,
      [audId]
    );

    return NextResponse.json({ data: dataRes.rows }, { status: 200 });
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
  // Check Insert or Update
  const riskId = body.risk_id;
  const riskAudId = body.risk_aud_id;
  const riskSourceId = body.risk_source_id;
  const riskDate = body.risk_date;
  const riskStatusId = body.risk_status_id;
  const riskTypeId = body.risk_type_id;
  const riskGroupId = body.risk_group_id;
  const riskSubGroupId = body.risk_sub_group_id;
  const riskCdTypeId = body.risk_cd_type_id;
  const riskContent = body.risk_content;

  if (
    !riskAudId ||
    !riskSourceId ||
    !riskDate ||
    !riskStatusId ||
    !riskTypeId ||
    !riskGroupId ||
    !riskSubGroupId ||
    !riskCdTypeId ||
    !riskContent
  ) {
    return NextResponse.json({ error: "Мэдээлэл бүрэн оруулна уу" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    if (riskId) {
      // UPDATE existing risk
      await client.query(
        `
          UPDATE audit_risks
          set risk_content = $2,
              risk_type_id = $3,
              risk_group_id = $4,
              risk_sub_group_id = $5,
              risk_cd_type_id = $6,
              risk_status_id = $7
          where risk_id = $8
        `,
        [
          riskContent,
          riskTypeId,
          riskGroupId,
          riskSubGroupId,
          riskCdTypeId,
          riskStatusId,
          riskContent,
          riskId,
        ]
      );
      // Insert audit_risk_actions
      await client.query(
        `INSERT INTO audit_risk_actions (ra_risk_id, ra_status_id, ra_date, ra_user_id) VALUES ($1, $2, current_timestamp, $3)`,
        [riskId, riskStatusId, userId]
      );
    } else {
      // INSERT new risk
      const newRisk = await client.query(
        `
        INSERT INTO audit_risks (risk_aud_id, risk_source_id, risk_date, risk_status_id, risk_type_id, risk_group_id, risk_sub_group_id, risk_cd_type_id, risk_content)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning risk_id
      `,
        [
          riskAudId,
          riskSourceId,
          riskDate,
          riskStatusId,
          riskTypeId,
          riskGroupId,
          riskSubGroupId,
          riskCdTypeId,
          riskContent,
        ]
      );
      const newRiskId = newRisk.rows[0].risk_id;
      // Insert audit_risk_actions
      await client.query(
        `INSERT INTO audit_risk_actions (ra_risk_id, ra_status_id, ra_date, ra_user_id) VALUES ($1, $2, current_timestamp, $3)`,
        [newRiskId, riskStatusId, userId]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ message: "Risk saved successfully" }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit risk update error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
