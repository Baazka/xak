import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const auditId = Number(formData.get("audit_id"));
    const files = formData.getAll("files") as File[];

    if (!Number.isInteger(auditId) || auditId <= 0) {
      return NextResponse.json({ error: "audit_id буруу байна" }, { status: 422 });
    }

    if (!files.length) {
      return NextResponse.json({ error: "Файл байхгүй байна" }, { status: 422 });
    }

    const uploadDir = path.join(process.cwd(), "uploads", String(auditId));
    const relativeDir = `/uploads/${auditId}`;

    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles: {
      file_id: number;
      original_name: string;
      stored_name: string;
      file_path: string;
    }[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name);
      const storedName = `${Date.now()}-${randomUUID()}${ext}`;
      const fullPath = path.join(uploadDir, storedName);

      await fs.writeFile(fullPath, buffer);

      const result = await db.query(
        `
          INSERT INTO reg_file (file_name, file_type, file_enc_name, file_path)
          VALUES ($1, $2, $3, $4)
          RETURNING file_id
        `,
        [file.name, ext, storedName, relativeDir]
      );

      const fileId = result.rows[0]?.file_id;

      savedFiles.push({
        file_id: fileId,
        original_name: file.name,
        stored_name: storedName,
        file_path: relativeDir,
      });
    }

    return NextResponse.json({
      message: "Файл амжилттай хадгалагдлаа",
      files: savedFiles,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Файл хадгалах үед алдаа гарлаа" }, { status: 500 });
  }
}
