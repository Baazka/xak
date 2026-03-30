import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import db from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const fileId = Number(id);

    if (!fileId) {
      return NextResponse.json({ error: "Файлын id буруу байна" }, { status: 400 });
    }

    const result = await db.query(
      `
      select 1 from dual
      WHERE id = $1
      `,
      [fileId]
    );

    const file = result.rows[0];

    if (!file) {
      return NextResponse.json({ error: "Файл олдсонгүй" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(path.resolve(file.file_path));

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": file.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`,
      },
    });
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    return NextResponse.json({ error: "Файл татах үед алдаа гарлаа" }, { status: 500 });
  }
}
