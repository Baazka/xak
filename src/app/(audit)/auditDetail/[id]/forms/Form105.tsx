"use client";

import DatePicker from "@/components/form/datePicker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";

type Props = {
  auditId: number;
};

type TableRow = {
  cr_id: number;
  cr_form_id: number;
  cr_ind_id: number;
  ind_group_label: string;
  ind_label: string;
  cr_rate_value: boolean | null;
  cr_description: string | null;
};

export default function Form105({ auditId }: Props) {
  const [data, setData] = useState<TableRow[]>([
    {
      cr_id: 0,
      cr_form_id: 0,
      cr_ind_id: 0,
      ind_group_label: "",
      ind_label: "",
      cr_rate_value: null,
      cr_description: null,
    },
  ]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const onChange = (id: number, value: boolean) => {
    setData((prev) =>
      prev.map((row) => (row.cr_ind_id === id ? { ...row, cr_rate_value: value } : row))
    );
  };

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form105?aud_id=${auditId}`);
        const result = await res.json();

        setData(result.data);
        setFormId(result.form_id);

        console.log(result, "result");
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

      const res = await fetchWithAuth(`/api/audit/form105/`, {
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

  const groupedData = data.reduce(
    (acc, row) => {
      if (!acc[row.ind_group_label]) {
        acc[row.ind_group_label] = [];
      }
      acc[row.ind_group_label].push(row);
      return acc;
    },
    {} as Record<string, TableRow[]>
  );
  return (
    <>
      {loading ? (
        <div>Уншиж байна...</div>
      ) : (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2 text-left w-10">№</th>
                <th className="border p-2 text-left">Суурь зарчмууд</th>
                <th className="border p-2 text-left w-2/3">Тайлбар</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedData).map(([groupLabel, rows]) => (
                <>
                  {/* GROUP HEADER */}
                  <tr key={groupLabel} className="bg-gray-100">
                    <td colSpan={4} className="border p-2 font-bold">
                      {groupLabel}
                    </td>
                  </tr>

                  {/* GROUP ROWS */}
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{row.ind_label}</td>
                      <td className="border p-2">
                        <textarea
                          value={row.cr_description || ""}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.cr_id === row.cr_id ? { ...r, cr_description: e.target.value } : r
                              )
                            )
                          }
                          className="w-full border rounded p-1"
                        />
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
            >
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </>
      )}
    </>
  );
}
