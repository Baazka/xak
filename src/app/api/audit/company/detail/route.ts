import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  //requirePermission(user.permissions, ["user.read"]);
  const body = await req.json();
  const audId = body.aud_id;
  const client = await db.connect();

  const detailRawData: {
    det_id: number;
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
        det_type_id,
        det_category,
        det_country,
        det_lastname,
        det_firstname,
        det_date,
      } = detailData;
      if (!det_id || det_id === null) {
        await client.query(
          `INSERT INTO audit_org_detail (det_aud_id, det_type_id, det_category, det_country, det_lastname, det_firstname, det_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING det_id`,
          [audId, det_type_id, det_category, det_country, det_lastname, det_firstname, det_date]
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
