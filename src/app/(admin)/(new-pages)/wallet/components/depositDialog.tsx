"use client";

import * as React from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useToast } from "@/context/ToastContext";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: () => void;
};

export default function DepositDialog({ open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  // const [username, setUsername] = React.useState("");
  // const [email, setEmail] = React.useState("");
  // const [password, setPassword] = React.useState("");
  const [depoAmount, setDepoAmount] = React.useState(0);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | "null">("null");
  const [metaLoading, setMetaLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError("null");

    setLoading(true);
    try {
      let res: Response;

      res = await fetchWithAuth("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depoAmount: depoAmount,
        }),
      });
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

  const handleAmount = (amt: number) => {
    // const u = data.find((x) => x.user_id === id);
    // if (!u) return;

    // setDialogMode("edit");
    // setSelectedUser({
    //   user_id: Number(u.user_id),
    //   user_firstname: u.user_firstname,
    //   user_email: u.user_email,
    //   user_register_no: u.user_register_no,
    //   user_phone: u.user_phone,
    //   role_id: u.role_id,
    //   role_text: u.role_text,
    // });
    // setOpen(true);
    if (amt > 5000000) {
      toast("error", "Цэнэглэх дүн буруу байна.");
    }
    setDepoAmount(amt);
  };

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
          <h2 className="text-lg font-semibold">Данс цэнэглэх</h2>

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
            <label className="mb-1 block text-sm">
              Цэнэглэх дүн: /Нэг удаад цэнэглэх дээд дүн 5,000,000₮ байна.
            </label>
            <input
              className="w-full rounded border px-3 py-2"
              value={depoAmount}
              onChange={(e) => handleAmount(Number(e.target.value))}
              placeholder="хэрэглэгчийн нэр"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded border px-4 py-2"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Цуцлах
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
