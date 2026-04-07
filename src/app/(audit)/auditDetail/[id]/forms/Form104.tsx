"use client";

import DatePicker from "@/components/form/datePicker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";

type Props = {
  auditId: number;
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

export default function Form104({ auditId }: Props) {
  const [bags, setBags] = useState<BagOption[]>([]);
  const [selectedBag, setSelectedBag] = useState("");

  const [data, setData] = useState<TableRow[]>([
    {
      noti_id: 0,
      noti_form_id: 0,
      ind_id: 0,
      ind_group_label: "",
      ind_label: "",
      noti_value: null,
    },
  ]);
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

        setData(result.data);
        setFormId(result.form_id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTableData();
  }, [selectedBag]);

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
      <div className="mb-4">
        <label className="mr-2">Баг:</label>
        <select
          value={selectedBag}
          onChange={(e) => setSelectedBag(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">Сонгох</option>
          {bags.map((bag) => (
            <option key={bag.team_id} value={bag.team_id}>
              {bag.user_firstname}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Уншиж байна...</div>
      ) : (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2 text-left">№</th>
                <th className="border p-2 text-left">Суурь зарчмууд</th>
                <th className="border p-2 text-left">Тайлбар</th>
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
                    <tr key={row.ind_id}>
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{row.ind_label}</td>
                      <td className="border p-2">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`noti-${row.ind_id}`}
                              checked={row.noti_value === true}
                              onChange={() => onChange(row.ind_id, true)}
                            />
                            Тийм
                          </label>

                          <label className="flex items-center gap-1">
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
