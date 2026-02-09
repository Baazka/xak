"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

export default function InviteOtpModal({
  org,
  onClose,
  onSuccess,
}: {
  org: { id: number; name: string; email: string | null };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState(org.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email || !email.includes("@")) return setError("Имэйл буруу байна");

    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username: org.name,
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Invite failed");
      }

      onSuccess();
    } catch (e: any) {
      setError(e?.message || "Invite failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000">
      <div className="bg-white w-full max-w-md rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Invite / OTP</h2>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <div className="mb-3">
          <label className="text-sm">Имэйл</label>
          <input
            className="border p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border rounded" onClick={onClose} disabled={loading}>
            Болих
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Илгээж байна..." : "Invite / OTP явуулах"}
          </button>
        </div>
      </div>
    </div>
  );
}
