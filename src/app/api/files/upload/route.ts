import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import db from "@/lib/db";
// import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const auditId = Number(formData.get("audit_id"));
    const files = formData.getAll("files") as File[];

    if (!auditId) {
      return NextResponse.json({ error: "audit_id байхгүй байна" }, { status: 422 });
    }

    if (!files.length) {
      return NextResponse.json({ error: "Файл байхгүй байна" }, { status: 422 });
    }

    const uploadDir = path.join(process.cwd(), "uploads", "audit", String(auditId));
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name);
      const storedName = `${Date.now()}-${randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, storedName);
      const relativePath = `/uploads/${auditId}/${storedName}`;
      await fs.writeFile(filePath, buffer);

      const result = await db.query(
        `
          INSERT INTO reg_file (file_name, file_type, file_enc_name, file_path)
          VALUES ($1, $2, $3, $4)
          RETURNING file_id
        `,
        [file.name, ext, storedName, relativePath]
      );

      const fileId = result.rows[0]?.file_id;

      savedFiles.push({
        file_id: fileId,
        original_name: file.name,
        stored_name: storedName,
        file_path: relativePath,
      });
    }

    return NextResponse.json({
      message: "Файл амжилттай хадгалагдлаа",
      files: savedFiles,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Файл хадгалах үед алдаа гарлаа" }, { status: 500 });
  }
}
