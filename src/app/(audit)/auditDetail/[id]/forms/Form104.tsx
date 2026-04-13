"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";

type Props = {
  auditId: number;
  formListId: number;
};

type BagOption = {
  team_id: number;
  user_firstname: string;
};

type TableRow = {
  noti_id: number;
  noti_form_id: number;
  ind_id: number;
  ind_group_label: string;
  ind_label: string;
  noti_value: boolean | null;
};

export default function Form104({ auditId, formListId }: Props) {
  const [bags, setBags] = useState<BagOption[]>([]);
  const [selectedBag, setSelectedBag] = useState("");

  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const onChange = (id: number, value: boolean) => {
    setData((prev) => prev.map((row) => (row.ind_id === id ? { ...row, noti_value: value } : row)));
  };

  useEffect(() => {
    async function loadBags() {
      const res = await fetchWithAuth("/api/audit/form104/meta?aud_id=" + auditId);
      const result = await res.json();

      setBags(result.data || []);

      if (result.data?.length > 0) {
        setSelectedBag(String(result.data[0].team_id));
      }
    }

    loadBags();
  }, [auditId]);

  useEffect(() => {
    if (!selectedBag) return;

    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(
          `/api/audit/form104?aud_id=${auditId}&team_id=${selectedBag}`
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
  }, [selectedBag, auditId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const noti_data = data.map((row) => ({
        noti_id: row.noti_id,
        ind_id: row.ind_id,
        form_id: formId,
        noti_value: row.noti_value,
      }));

      const res = await fetchWithAuth(`/api/audit/form104/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          status_id: 1,
          noti_data,
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

  const groupedData = (Array.isArray(data) ? data : []).reduce(
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
      <div className="m-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">Баг:</label>

          <select
            value={selectedBag}
            onChange={(e) => setSelectedBag(e.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Сонгох</option>
            {bags.map((bag) => (
              <option key={bag.team_id} value={bag.team_id}>
                {bag.user_firstname}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {saving && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
          )}
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </div>
      {loading ? (
        <div>Уншиж байна...</div>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left">№</th>
                <th className="border p-2 text-left">Суурь зарчмууд</th>
                <th className="border p-2 text-left">Тайлбар</th>
              </tr>
            </thead>
            {Object.entries(groupedData).map(([groupLabel, rows]) => (
              <tbody key={groupLabel}>
                <tr className="bg-gray-100">
                  <td colSpan={4} className="border p-2 font-bold">
                    {groupLabel}
                  </td>
                </tr>
                {rows.map((row, index) => (
                  <tr key={row.ind_id}>
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{row.ind_label}</td>
                    <td className="border p-2">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`noti-${row.ind_id}`}
                            checked={row.noti_value === true}
                            onChange={() => onChange(row.ind_id, true)}
                          />
                          Тийм
                        </label>

                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`noti-${row.ind_id}`}
                            checked={row.noti_value === false}
                            onChange={() => onChange(row.ind_id, false)}
                          />
                          Үгүй
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
