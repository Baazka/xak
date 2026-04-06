"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";

type Props = {
  auditId: number;
};

type CompanyFormData = {
  org_legal_name: string;
  org_regno: string;
};

export default function FormAuditCompany({ auditId }: Props) {
  const [data, setData] = useState<CompanyFormData>({
    org_legal_name: "",
    org_regno: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(`/api/audit/company?aud_id=${auditId}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (res.ok) {
          setData({
            org_legal_name: json.data.org_legal_name ?? "",
            org_regno: json.data.org_regno ?? "",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [auditId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch(`/api/audit/company/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, aud_id: auditId }),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }

      alert("Амжилттай хадгаллаа");
    } catch (error) {
      console.error(error);
      alert("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Уншиж байна...</div>;

  return (
    <div className="space-y-4 rounded-lg border p-4 dark:border-white/[0.05] dark:bg-[#0f172a]">
      <h2 className="text-lg font-semibold">Маягт 01</h2>

      <div className="space-y-2">
        <label className="block text-sm">Байгууллагын нэр</label>
        <input
          value={data.org_legal_name}
          onChange={(e) => setData((prev) => ({ ...prev, org_legal_name: e.target.value }))}
          className="w-full rounded border px-3 py-2 dark:border-white/[0.08] dark:bg-[#111827]"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm">Регистр</label>
        <input
          value={data.org_regno}
          onChange={(e) => setData((prev) => ({ ...prev, org_regno: e.target.value }))}
          className="w-full rounded border px-3 py-2 dark:border-white/[0.08] dark:bg-[#111827]"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Хадгалж байна..." : "Хадгалах"}
      </button>
    </div>
  );
}
