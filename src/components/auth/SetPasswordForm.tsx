"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  token: string;
  email: string;
};

export default function SetPasswordForm({ token, email }: Props) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = useMemo(() => {
    if (!email || !token) return false;
    if (password.length < 6) return false;
    if (password !== confirm) return false;
    return true;
  }, [email, token, password, confirm]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || loading) return;

    setLoading(true);
    try {
      // 1) set-password
      const res = await fetch("/api/users/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || data?.message || "Нууц үг хадгалахад алдаа гарлаа");
        return;
      }

      alert("Нууц үг амжилттай шинэчлэгдлээ. Одоо нэвтэрч орно уу.");

      router.replace(`/signin?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="rounded-lg border p-4">
        <h1 className="text-lg font-semibold">Токен олдсонгүй</h1>
        <p className="text-sm text-gray-500 mt-1">
          Энэ холбоос буруу эсвэл хугацаа дууссан байж магадгүй. OTP-оо дахин авч оролдоно уу.
        </p>
        <div className="mt-3">
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => router.replace("/verify-otp")}
          >
            OTP баталгаажуулах руу буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-6">
          <h1 className="text-xl font-semibold">Нууц үг шинээр үүсгэх</h1>

          <div className="text-sm text-gray-500">
            Имэйл: <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Шинэ нууц үг (8 тэмдэгт)</label>
            <input
              className="w-full h-11 rounded-lg border px-3 bg-transparent"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Дахин давтах</label>
            <input
              className="w-full h-11 rounded-lg border px-3 bg-transparent"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {password && confirm && password !== confirm && (
            <div className="text-sm text-red-600">Нууц үг таарахгүй байна.</div>
          )}

          <button
            type="submit"
            disabled={!valid || loading}
            className="w-full h-11 rounded-lg bg-blue-600 text-white disabled:opacity-60"
          >
            {loading ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </form>
      </div>
    </div>
  );
}
