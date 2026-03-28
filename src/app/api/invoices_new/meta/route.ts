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

  const balanceSql = `
    SELECT sum(case when t.tran_cr_dt = 'DT' then t.tran_amount else -1*t.tran_amount end)::integer AS balance
    from reg_transactions t
    join reg_aud_org ao on t.tran_org_id = ao.org_id
    join ref_transaction_type tt on t.tran_type_id = tt.tran_type_id
    join ref_transaction_status ts on t.tran_status_id = ts.status_id
    left join reg_invoices inv on t.tran_inv_id = inv.inv_id
    ${whereClause}
    `;

  const client = await db.connect();

  try {
    const [balanceRes] = await Promise.all([client.query(balanceSql)]);

    return NextResponse.json({
      balance: balanceRes.rows[0].balance,
    });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
