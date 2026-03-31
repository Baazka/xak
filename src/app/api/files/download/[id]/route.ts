import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import db from "@/lib/db";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/files/download/[id]">) {
  try {
    const { id } = await ctx.params;
    const fileId = Number(id);

    if (!Number.isInteger(fileId) || fileId <= 0) {
      return NextResponse.json({ error: "Файлын id буруу байна" }, { status: 400 });
    }

    const result = await db.query(
      `
      SELECT id, file_path, mime_type, original_name
      FROM audit_files
      WHERE id = $1
      `,
      [fileId]
    );

    const file = result.rows[0];

    if (!file) {
      return NextResponse.json({ error: "Файл олдсонгүй" }, { status: 404 });
    }

    const absPath = path.resolve(file.file_path);
    const fileBuffer = await fs.readFile(absPath);
    const body = new Uint8Array(fileBuffer);

    return new NextResponse(body, {
      headers: {
        "Content-Type": file.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          file.original_name
        )}`,
      },
    });
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    return NextResponse.json({ error: "Файл татах үед алдаа гарлаа" }, { status: 500 });
  }
}
