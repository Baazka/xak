// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  const hashed = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO users (email, password, name) VALUES ($1, $2, $3)`,
    [email, hashed, name]
  );
  return NextResponse.json({ success: true });
}
