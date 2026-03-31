import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();
  console.log(body, "<<<<<<<<audit body");
  // 1st step: insert audit_data
  const audYear = body.aud_year;
  const audName = body.aud_name;
  const audBeginDate = body.aud_begin_date;
  const audEndDate = body.aud_end_date;
  const audCompId = body.aud_comp_id;
  const orgId = user.org_id;
  const userId = user.id;

  if (!audYear || !audName || !audBeginDate || !audEndDate || !audCompId) {
    return NextResponse.json({ error: "Мэдээлэл дутуу байна." }, { status: 422 });
  }

  // 2nd step: insert audit_team
  const teamData: { user_id: number; role_id: number }[] = body.team_data; // expect array of { user_id, role_id }

  const paymentMethod = body.payment_method; // expect string like "CASH", "BANK", etc.
  // 3rd step: insert invoice
  // 4th step: insert transactions
  // 5th step: insert invoice_audit

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const audCodeRes = await client.query(`SELECT nextval('audit_code_seq') AS seq`);
    const audCodeSeq = audCodeRes.rows[0].seq;
    const audCode = `AUD${String(audCodeSeq).padStart(6, "0")}`;

    // 1st step: insert audit_data
    const audDataRes = await client.query(
      `INSERT INTO audit_data (aud_code, aud_org_id, aud_comp_id, aud_type_id, aud_year, aud_name, aud_begin_date, aud_end_date, aud_status_id, created_by, created_date)
           VALUES ($1, $2, $3, 1, $4, $5, $6, $7, 1, $8, current_timestamp)
           RETURNING aud_id`,
      [audCode, orgId, audCompId, audYear, audName, audBeginDate, audEndDate, userId]
    );
    const NewAudId = audDataRes.rows[0].aud_id;

    // 2nd step: insert audit_team
    for (const member of teamData) {
      const { user_id, role_id } = member;

      await client.query(
        `INSERT INTO audit_team (team_aud_id, team_role_id, team_user_id, is_active, created_by, created_date)
             VALUES ($1, $2, $3, 1, $4, current_timestamp)`,
        [NewAudId, role_id, user_id, userId]
      );
    }

    if (paymentMethod === "TICKET") {
      // select free invoice_audit id
      const assignInvaRes = await client.query(
        `SELECT inva_id FROM reg_invoice_audit ia JOIN reg_invoices i on ia.inva_inv_id = i.inv_id WHERE ia.aud_id is null And i.inv_status_id = 2 and i.inv_org_id = $1 LIMIT 1`,
        [orgId]
      );
      const invaId = assignInvaRes.rows[0]?.inva_id;
      // UPDATE INVOICE_AUDIT
      await client.query(
        `UPDATE reg_invoice_audit SET inva_aud_id = $1, inva_assign_date = current_timestamp WHERE inva_id = $2`,
        [NewAudId, invaId]
      );
    } else {
      //3rd step: insert invoice
      const invCodeRes = await client.query(`SELECT nextval('invoice_code_seq') AS seq`);
      const invCodeSeq = invCodeRes.rows[0].seq;
      const invCode = `INV${String(invCodeSeq).padStart(6, "0")}`;

      let invAmount = 100000;

      const invRes = await client.query(
        `INSERT INTO reg_invoices (inv_no, inv_org_id, inv_type_id, inv_date, inv_aud_count, inv_amount, inv_status_id, created_by, created_date)
              VALUES ($1, $2, 1, current_timestamp, 1, $3, 2, $4, current_timestamp)
              RETURNING inv_id`,
        [invCode, orgId, invAmount, userId]
      );
      const NewInvId = invRes.rows[0].inv_id;
      //4th step: insert transactions
      const tranDTCodeRes = await client.query(`SELECT nextval('tran_code_seq') AS seq`);
      const tranDTCodeSeq = tranDTCodeRes.rows[0].seq;
      const tranDTCode = `TR02-${String(tranDTCodeSeq).padStart(6, "0")}`;

      await client.query(
        `INSERT INTO reg_transactions (tran_type_id, tran_cr_dt, tran_date, tran_status_id, tran_code, tran_amount, tran_org_id, tran_user_id, created_by, created_date)
              VALUES (2, 'DT', current_timestamp, 1, $1, $2, $3, $4, $4, current_timestamp)`,
        [tranDTCode, invAmount, orgId, userId]
      );

      const tranCRCodeRes = await client.query(`SELECT nextval('tran_code_seq') AS seq`);
      const tranCRCodeSeq = tranCRCodeRes.rows[0].seq;
      const tranCRCode = `TR03-${String(tranCRCodeSeq).padStart(6, "0")}`;

      await client.query(
        `INSERT INTO reg_transactions (tran_type_id, tran_cr_dt, tran_date, tran_status_id, tran_code, tran_amount, tran_org_id, tran_user_id, tran_inv_id, created_by, created_date)
              VALUES (3, 'CR', current_timestamp, 1, $1, $2, $3, $4, $5, $4, current_timestamp)`,
        [tranCRCode, invAmount, orgId, userId, NewInvId]
      );
      // 5th step: insert invoice_audit
      await client.query(
        `INSERT INTO reg_invoice_audit (inva_inv_id, inva_aud_id, inva_assign_date, created_by, created_date)
              VALUES ($1, $2, current_timestamp, $3, current_timestamp)`,
        [NewInvId, NewAudId, userId]
      );
    }
    await client.query("COMMIT");
    return NextResponse.json({ aud_id: NewAudId }, { status: 201 });
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Audit create error:", err);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
