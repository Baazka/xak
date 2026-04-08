import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import db from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: RouteContext<"/api/files/delete/[id]">) {
  try {
    const { id } = await params;
    const fileId = Number(id);

    if (!Number.isInteger(fileId) || fileId <= 0) {
      return NextResponse.json({ error: "Файлын id буруу байна" }, { status: 400 });
    }

    const result = await db.query(
      `
      SELECT file_id, file_name, file_enc_name, file_path
      FROM reg_file
      WHERE file_id = $1
      `,
      [fileId]
    );

    const file = result.rows[0];

    if (!file) {
      return NextResponse.json({ error: "Файл олдсонгүй" }, { status: 404 });
    }

    const absPath = path.join(
      process.cwd(),
      String(file.file_path).replace(/^\/+/, ""),
      file.file_enc_name
    );
    try {
      await fs.unlink(absPath);
    } catch (err: any) {
      if (err?.code !== "ENOENT") {
        throw err;
      }
    }
    await db.query(
      `
      DELETE FROM reg_file
      WHERE file_id = $1
      `,
      [fileId]
    );

    return NextResponse.json({
      message: "Файл амжилттай устгагдлаа",
      file_id: file.file_id,
      file_name: file.file_name,
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({ error: "Файл устгах үед алдаа гарлаа" }, { status: 500 });
  }
}
