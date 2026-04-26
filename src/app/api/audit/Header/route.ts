//src/app/api/Header/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { withAuth } from "@/lib/withAuth";
import { requirePermission } from "@/lib/requirePermission";
import { JwtPayload } from "@/lib/jwtPayload";

export const POST = withAuth(async function POST(req: NextRequest, user) {
  //requirePermission(user.permissions, ["xakorg.create"]);

  try {
    const body = await req.json();
    const userId = user.id;
    const { type, aud_id } = body;

    if (!aud_id || !type) {
      return NextResponse.json({ error: "aud_id эсвэл type байхгүй байна" }, { status: 400 });
    }
    if (type === "basic") {
      const { aud_name, aud_year, aud_begin_date, aud_end_date, aud_contract_file_id } = body;

      await db.query(
        `
        UPDATE audit_data
        SET
          aud_name = $2,
          aud_year = $3,
          aud_begin_date = $4,
          aud_end_date = $5,
          aud_contract_file_id = $6
        WHERE aud_id = $1
        `,
        [aud_id, aud_name, aud_year, aud_begin_date, aud_end_date, aud_contract_file_id]
      );

      return NextResponse.json({ success: true, type: "basic" });
    }

    if (type === "team") {
      const teamData: { user_id: number; role_id: number }[] = body.team_data;
      console.log(teamData, "<========teamData");
      console.log(body, "<========bodyData");
      if (!Array.isArray(teamData)) {
        return NextResponse.json({ error: "team_data буруу байна" }, { status: 400 });
      }

      const team_id = [];

      for (const member of teamData) {
        const { user_id, role_id } = member;

        const result = await db.query(
          `SELECT team_id FROM audit_team WHERE team_aud_id = $1 AND team_user_id = $2 AND team_role_id = $3 AND is_active = 1`,
          [aud_id, user_id, role_id]
        );

        if (result.rows.length === 0) {
          const resInsert = await db.query(
            `INSERT INTO audit_team (team_aud_id, team_role_id, team_user_id, is_active, created_by, created_date)
               VALUES ($1, $2, $3, 1, $4, current_timestamp) RETURNING team_id`,
            [aud_id, role_id, user_id, userId]
          );
          team_id.push(resInsert.rows[0].team_id);
        } else {
          team_id.push(result.rows[0].team_id);
        }
      }

      // soft delete team user
      await db.query(
        `UPDATE audit_team SET is_active = 0 WHERE team_aud_id = $1 AND team_id not in (${team_id.join(
          ","
        )}) AND is_active = 1`,
        [aud_id]
      );

      return NextResponse.json({ success: true, type: "team" });
    }

    return NextResponse.json({ error: "type буруу байна" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});
