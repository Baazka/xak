import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);

  const sp = new URL(req.url).searchParams;
  const audId = sp.get("aud_id");
  if (!audId) {
    return NextResponse.json({ error: "Audit ID is required" }, { status: 400 });
  }

  const client = await db.connect();
  try {
    const dataRes = await client.query(
      `
      select 
        det_id,
        det_aud_id,
        det_form_id,
        det_type_id,
        dt.type_name det_type_name,
        det_category,
        det_country,
        det_lastname,
        det_firstname,
        to_char(det_date,'YYYY.MM.DD') det_date
        from audit_org_detail od
        join ref_org_detail_type dt on od.det_type_id = dt.type_id
        where det_aud_id = $1
    `,
      [audId]
    );

    return NextResponse.json(
      {
        data: dataRes.rows,
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
  //requirePermission(user.permissions, ["user.read"]);
  const body = await req.json();
  const audId = body.aud_id;
  const formId = body.form_id;
  const client = await db.connect();

  const detailRawData: {
    det_id: number;
    det_form_id: number;
    det_type_id: number;
    det_category: string;
    det_country: string;
    det_lastname: string;
    det_firstname: string;
    det_date: Date;
  }[] = body.detail_raw_data; // expect array of {det_id, det_type_id, det_category, det_country, det_lastname, det_firstname, det_date}

  try {
    for (const detailData of detailRawData) {
      const {
        det_id,
        det_form_id,
        det_type_id,
        det_category,
        det_country,
        det_lastname,
        det_firstname,
        det_date,
      } = detailData;
      if (!det_id || det_id === null) {
        await client.query(
          `INSERT INTO audit_org_detail (det_aud_id, det_form_id, det_type_id, det_category, det_country, det_lastname, det_firstname, det_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING det_id`,
          [
            audId,
            formId,
            det_type_id,
            det_category,
            det_country,
            det_lastname,
            det_firstname,
            det_date,
          ]
        );
      } else {
        await client.query(
          `UPDATE audit_org_detail SET det_type_id = $1, det_category = $2, det_country = $3, det_lastname = $4, det_firstname = $5, det_date = $6 WHERE det_id = $7`,
          [det_type_id, det_category, det_country, det_lastname, det_firstname, det_date, det_id]
        );
      }
    }
    return NextResponse.json({ message: "Details saved successfully" }, { status: 200 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});

export const DELETE = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.create"]);

  const body = await req.json();
  const detId = body.det_id;
  const client = await db.connect();

  if (!detId) {
    return NextResponse.json({ error: "Detail ID is required" }, { status: 400 });
  }
  try {
    await client.query(`DELETE FROM audit_org_detail WHERE det_id = $1`, [detId]);
    return NextResponse.json({ message: "Detail deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
});
