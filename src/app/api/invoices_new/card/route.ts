import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const orgId = user.org_id;
  let whereClause = "WHERE 1=1";
  if (user.user_level_id > 2) {
    whereClause += ` AND TRAN_ORG_ID = ${user.org_id} `;
  }

  const tranSql = `
    SELECT sum(case when t.tran_cr_dt = 'DT' then t.tran_amount else -1*t.tran_amount end)::integer AS balance
    from reg_transactions t
    join reg_aud_org ao on t.tran_org_id = ao.org_id
    join ref_transaction_type tt on t.tran_type_id = tt.tran_type_id
    join ref_transaction_status ts on t.tran_status_id = ts.status_id
    left join reg_invoices inv on t.tran_inv_id = inv.inv_id
    ${whereClause}
    `;

  let whereClause2 = "WHERE 1=1";
  if (user.user_level_id > 2) {
    whereClause2 += ` AND INV_ORG_ID = ${user.org_id} `;
  }

  const invSql = `
    select 
	count(*)::int invTotal,
	sum(inv_aud_count)::int audTotal,
	sum(inv_amount)::int amountTotal,
	sum(case when inv_status_id = 1 then 1 else 0 end)::int unpaidTotal,
	sum(case when inv_status_id = 1 then inv_amount else 0 end)::int unpaidAmount
    from reg_invoices
    ${whereClause2}
    `;

  const client = await db.connect();

  try {
    const [tranRes, invRes] = await Promise.all([client.query(tranSql), client.query(invSql)]);

    console.log(
      "res ",
      tranRes.rows[0].balance,
      invRes.rows[0].invtotal,
      invRes.rows[0].audtotal,
      invRes.rows[0].amounttotal,
      invRes.rows[0].unpaidtotal,
      invRes.rows[0].unpaidamount
    );

    return NextResponse.json({
      balance: tranRes.rows[0].balance,
      invTotal: invRes.rows[0].invtotal,
      audTotal: invRes.rows[0].audtotal,
      amountTotal: invRes.rows[0].amounttotal,
      unpaidTotal: invRes.rows[0].unpaidtotal,
      unpaidAmount: invRes.rows[0].unpaidamount,
    });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
