"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  cr_id: number;
  cr_form_id: number;
  cr_ind_id: number;
  ind_group_label: string;
  ind_label: string;
  cr_rate_value: string | null;
  cr_description: string | null;
};

export default function Form203({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(
          `/api/audit/form201_203?aud_id=${auditId}&form_list_id=${formListId}`
        );
        const result = await res.json();

        setData(Array.isArray(result.data) ? result.data : []);
        setFormId(result.form_id ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTableData();
  }, [auditId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const cr_data = data.map((row) => ({
        cr_id: row.cr_id,
        cr_form_id: row.cr_form_id,
        cr_ind_id: row.cr_ind_id,
        form_id: formId,
        cr_rate_value: row.cr_rate_value,
        cr_description: row.cr_description,
      }));

      const res = await fetchWithAuth(`/api/audit/form201_203/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          status_id: 1,
          cr_data,
        }),
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

  return (
    <>
      {loading ? (
        <div>Уншиж байна...</div>
      ) : (
        <>
          <div className="m-2 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left w-10">№</th>
                <th className="border p-2 text-left">Үзүүлэлт</th>
                <th className="border p-2 text-left">Үнэлгээ</th>
                <th className="border p-2 text-left w-2/3">Тайлбар</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
