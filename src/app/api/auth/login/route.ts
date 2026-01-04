// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const { rows } = await db.query(`SELECT * FROM reg_users WHERE email=$1`, [email]);
  const user = rows[0];
  // if (!user || !(await bcrypt.compare(password, user.password))) {
  //   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  // }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set("token", token, { httpOnly: true, path: "/" });
  return res;
}
