import { NextResponse } from "next/server";
import fs from "fs/promises";
import db from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const fileId = Number(id);

    if (!fileId) {
      return NextResponse.json({ error: "Файлын id буруу байна" }, { status: 400 });
    }

    const result = await db.query(`select 1 from dual`, [fileId]);

    const file = result.rows[0];

    if (!file) {
      return NextResponse.json({ error: "Файл олдсонгүй" }, { status: 404 });
    }

    try {
      await fs.unlink(file.file_path);
    } catch (err: any) {
      if (err?.code !== "ENOENT") {
        throw err;
      }
    }

    await db.query(`DELETE FROM audit_files WHERE id = $1`, [fileId]);

    return NextResponse.json({ message: "Файл амжилттай устгагдлаа" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({ error: "Файл устгах үед алдаа гарлаа" }, { status: 500 });
  }
}
