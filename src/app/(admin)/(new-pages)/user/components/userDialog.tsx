"use client";

import * as React from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { User } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  mode: "create" | "edit";
  initialUser?: Pick<
    User,
    | "user_id"
    | "user_firstname"
    | "user_email"
    | "user_register_no"
    | "user_phone"
    | "role_id"
    | "role_text"
  > | null;

  onSaved?: () => void;
};

export default function UserDialog({ open, onOpenChange, mode, initialUser, onSaved }: Props) {
  const isEdit = mode === "edit";

  // const [username, setUsername] = React.useState("");
  // const [email, setEmail] = React.useState("");
  // const [password, setPassword] = React.useState("");
  const [regno, setRegno] = React.useState("");
  const [user_firstname, setUser_firstname] = React.useState("");
  const [user_email, setUser_email] = React.useState("");
  const [user_phone, setUser_phone] = React.useState("");
  const [user_password, setUser_password] = React.useState("");
  const [roleId, setRoleId] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    if (isEdit && initialUser) {
      setRegno(initialUser.user_register_no ?? "");
      setUser_firstname(initialUser.user_firstname ?? "");
      setUser_email(initialUser.user_email ?? "");
      setUser_password("");
    } else {
      setUser_firstname("");
      setUser_email("");
      setUser_password("");
    }
    setError(null);
    setLoading(false);
  }, [open, isEdit, initialUser]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    const u = user_firstname.trim();
    const em = user_email.trim().toLowerCase();

    if (!u || !em) {
      setError("Нэр, имэйлээ бөглөнө үү.");
      return;
    }
    if (!isEdit && !user_password) {
      setError("Нууц үгээ бөглөнө үү.");
      return;
    }

    setLoading(true);
    try {
      let res: Response;

      if (isEdit) {
        const id = initialUser?.user_id;
        if (!id) {
          setError("Засах хэрэглэгч сонгогдоогүй байна.");
          return;
        }

        // ✅ EDIT → PUT /api/users/:id
        res = await fetchWithAuth(`/api/users/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_firstname: u, user_email: em }),
        });
      } else {
        // ✅ CREATE → POST /api/users
        res = await fetchWithAuth("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_firstname: u, user_email: em, user_password }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || "Хадгалахад алдаа гарлаа");
        return;
      }

      onOpenChange(false);
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || "Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{isEdit ? "Хэрэглэгч засах" : "Шинэ хэрэглэгч"}</h2>

          <button
            className="rounded px-2 py-1 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Нэр</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={user_firstname}
              onChange={(e) => setUser_firstname(e.target.value)}
              placeholder="username"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Имэйл</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={user_email}
              onChange={(e) => setUser_email(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm">Нууц үг</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={user_password}
                onChange={(e) => setUser_password(e.target.value)}
                placeholder="********"
                type="password"
              />
            </div>
          )}

          {error ? (
            <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded border px-4 py-2"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Болих
            </button>
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
