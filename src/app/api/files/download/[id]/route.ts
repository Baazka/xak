import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: RouteContext<"/api/files/download/[id]">) {
  try {
    const { id } = await params;
    const fileId = Number(id);

    if (!Number.isInteger(fileId) || fileId <= 0) {
      return NextResponse.json({ error: "Файлын id буруу байна" }, { status: 400 });
    }

    const result = await db.query(
      `
      SELECT file_id, file_name, file_type, file_enc_name, file_path
      FROM reg_file
      WHERE file_id = $1
      `,
      [fileId]
    );

    const file = result.rows[0];

    if (!file) {
      return NextResponse.json({ error: "Файл олдсонгүй" }, { status: 404 });
    }

    const normalizedPath = String(file.file_path).replace(/^\/+/, "");
    const absPath = path.join(process.cwd(), normalizedPath);

    const fileBuffer = await fs.readFile(absPath);

    const mimeType = getMimeType(file.file_type);
    const disposition =
      mimeType === "application/pdf"
        ? `inline; filename*=UTF-8''${encodeURIComponent(file.file_name)}`
        : `attachment; filename*=UTF-8''${encodeURIComponent(file.file_name)}`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": disposition,
      },
    });
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    return NextResponse.json({ error: "Файл татах үед алдаа гарлаа" }, { status: 500 });
  }
}

function getMimeType(ext: string | null | undefined) {
  const value = (ext || "").toLowerCase();

  switch (value) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".xls":
      return "application/vnd.ms-excel";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".txt":
      return "text/plain; charset=utf-8";
    case ".zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}
