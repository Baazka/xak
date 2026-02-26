"use client";

import * as React from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { User } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  mode: "create" | "edit";
  initialUser?: Pick<User, "id" | "username" | "email"> | null;

  onSaved?: () => void;
};

export default function UserDialog({ open, onOpenChange, mode, initialUser, onSaved }: Props) {
  const isEdit = mode === "edit";

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    if (isEdit && initialUser) {
      setUsername(initialUser.username ?? "");
      setEmail(initialUser.email ?? "");
      setPassword("");
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
    }
    setError(null);
    setLoading(false);
  }, [open, isEdit, initialUser]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    const u = username.trim();
    const em = email.trim().toLowerCase();

    if (!u || !em) {
      setError("Нэр, имэйлээ бөглөнө үү.");
      return;
    }
    if (!isEdit && !password) {
      setError("Нууц үгээ бөглөнө үү.");
      return;
    }

    setLoading(true);
    try {
      let res: Response;

      if (isEdit) {
        const id = initialUser?.id;
        if (!id) {
          setError("Засах хэрэглэгч сонгогдоогүй байна.");
          return;
        }

        // ✅ EDIT → PUT /api/users/:id
        res = await fetchWithAuth(`/api/users/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u, email: em }),
        });
      } else {
        // ✅ CREATE → POST /api/users
        res = await fetchWithAuth("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u, email: em, password }),
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Имэйл</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm">Нууц үг</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
