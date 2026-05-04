import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";
import { info } from "console";

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();
  console.log(body, "<========body");
  // 1st step: insert audit_data
  const audYear = body.aud_year;
  const audName = body.aud_name;
  const audBeginDate = body.aud_begin_date;
  const audEndDate = body.aud_end_date;
  const audCompId = body.audCompId;
  const orgId = user.org_id;
  const userId = user.id;
  const audFileId = body.aud_file_id;

  if (!audYear || !audName || !audBeginDate || !audEndDate || !audCompId) {
    return NextResponse.json({ error: "Мэдээлэл дутуу байна." }, { status: 422 });
  }

  // Insert audit_organization
  const compData = body.comp_data; // expect { org_regno, org_legal_name, org_founded_date, org_certno, org_main_operation, org_responsibility, org_type, org_is_special, org_shareholder, org_founder, org_asset, org_address, org_phone, org_email, org_head_name, org_head_phone, org_head_email, org_acc_name, org_acc_phone, org_acc_email, org_operation_data[], org_detail_data[]}
  // Insert audit_org_operation
  const orgOperationData: { op_code: string; op_name: string; op_date: Date }[] =
    body.org_operation_data; // expect array of { op_code, op_name, op_date }
  // Insert audit_org_detail
  const orgDetailData: {
    det_type_id: number;
    det_category: string;
    det_country: string;
    det_lastname: string;
    det_firstname: string;
    det_date: Date;
  }[] = body.org_detail_data; // expect array of { det_type_id, det_category, det_country, det_lastname, det_firstname, det_date }

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
      `INSERT INTO audit_data (aud_code, aud_org_id, aud_comp_id, aud_type_id, aud_year, aud_name, aud_begin_date, aud_end_date, aud_status_id, aud_contract_file_id, created_by, created_date)
           VALUES ($1, $2, $3, 1, $4, $5, $6, $7, 1, $8, $9, current_timestamp)
           RETURNING aud_id`,
      [audCode, orgId, audCompId, audYear, audName, audBeginDate, audEndDate, audFileId, userId]
    );
    const NewAudId = audDataRes.rows[0].aud_id;

    // Insert form audit_org_info
    const orgInfoRes = await client.query(
      `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 22, 1) RETURNING form_id`,
      [NewAudId]
    );
    const infoFormId = orgInfoRes.rows[0].form_id;

    await client.query(
      `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, $2, current_timestamp, $3)`,
      [infoFormId, 1, userId]
    );

    // Insert audit_org_info
    await client.query(
      `INSERT INTO audit_org_info (info_aud_id, info_form_id, info_reg_no, info_legal_name, info_founded_date, info_certno, info_main_operation, info_type, info_is_special, info_shareholder, info_founder, info_asset, info_address, info_phone, info_email, info_head_name, info_head_phone, info_head_email, info_acc_name, info_acc_phone, info_acc_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        NewAudId,
        infoFormId,
        compData.org_regno,
        compData.org_legal_name,
        compData.org_founded_date,
        compData.org_certno,
        compData.org_main_operation,
        compData.org_type,
        compData.org_is_special,
        compData.org_shareholder,
        compData.org_founder,
        compData.org_asset,
        compData.org_address,
        compData.org_phone,
        compData.org_email,
        compData.org_head_name,
        compData.org_head_phone,
        compData.org_head_email,
        compData.org_acc_name,
        compData.org_acc_phone,
        compData.org_acc_email,
      ]
    );

    // Insert audit_organization
    await client.query(
      `INSERT INTO audit_organization (aud_id, created_by, created_date) VALUES ($1, $2, current_timestamp)`,
      [NewAudId, userId]
    );
    // Insert form audit_org_operation
    const orgRes = await client.query(
      `INSERT INTO audit_forms (form_aud_id, form_list_id, form_status_id) VALUES ($1, 23, 1) RETURNING form_id`,
      [NewAudId]
    );
    const orgFormId = orgRes.rows[0].form_id;

    await client.query(
      `INSERT INTO audit_form_actions (action_form_id, action_status_id, action_date, action_by) VALUES ($1, $2, current_timestamp, $3)`,
      [orgFormId, 1, userId]
    );

    // Insert audit_org_operation
    for (const op of orgOperationData) {
      await client.query(
        `INSERT INTO audit_org_operation (op_aud_id, op_form_id, op_code, op_name, op_date, op_flag)
             VALUES ($1, $2, $3, $4, $5, true)`,
        [NewAudId, orgFormId, op.op_code, op.op_name, op.op_date]
      );
    }
    // Insert audit_org_detail
    for (const det of orgDetailData) {
      await client.query(
        `INSERT INTO audit_org_detail (det_aud_id, det_form_id, det_type_id, det_category, det_country, det_lastname, det_firstname, det_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          NewAudId,
          orgFormId,
          det.det_type_id,
          det.det_category,
          det.det_country,
          det.det_lastname,
          det.det_firstname,
          det.det_date,
        ]
      );
    }

    // 2nd step: insert audit_team
    for (const member of teamData) {
      const { user_id, role_id } = member;

      await client.query(
        `INSERT INTO audit_team (team_aud_id, team_role_id, team_user_id, is_active, created_by, created_date)
             VALUES ($1, $2, $3, 1, $4, current_timestamp)`,
        [NewAudId, role_id, user_id, userId]
      );
    }

    if (paymentMethod === "Ticket") {
      // select free invoice_audit id
      const assignInvaRes = await client.query(
        `SELECT inva_id FROM reg_invoice_audit ia JOIN reg_invoices i on ia.inva_inv_id = i.inv_id WHERE ia.inva_aud_id is null And i.inv_status_id = 2 and i.inv_org_id = $1 LIMIT 1`,
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
      if (paymentMethod === "Wallet") {
        const tranCRCodeRes = await client.query(`SELECT nextval('tran_code_seq') AS seq`);
        const tranCRCodeSeq = tranCRCodeRes.rows[0].seq;
        const tranCRCode = `TR04-${String(tranCRCodeSeq).padStart(6, "0")}`;

        await client.query(
          `INSERT INTO reg_transactions (tran_type_id, tran_cr_dt, tran_date, tran_status_id, tran_code, tran_amount, tran_org_id, tran_user_id, tran_inv_id, created_by, created_date)
              VALUES (4, 'CR', current_timestamp, 1, $1, $2, $3, $4, $5, $4, current_timestamp)`,
          [tranCRCode, invAmount, orgId, userId, NewInvId]
        );
      } else {
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
      }
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
