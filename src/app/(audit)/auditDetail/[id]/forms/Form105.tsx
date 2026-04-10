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

export default function Form105({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const onRadioChange = (cr_id: number, value: string) => {
    setData((prev) =>
      prev.map((row) => (row.cr_id === cr_id ? { ...row, cr_rate_value: value } : row))
    );
  };

  const onSelectChange = (cr_id: number, value: string) => {
    setData((prev) =>
      prev.map((row) => (row.cr_id === cr_id ? { ...row, cr_rate_value: value } : row))
    );
  };

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form105?aud_id=${auditId}`);
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

  const safeData = Array.isArray(data) ? data : [];

  const normalData = safeData.filter((row) => row.cr_ind_id !== 37);
  const lastRowData = safeData.filter((row) => row.cr_ind_id === 37);

  const groupedData = normalData.reduce(
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
            <tbody>
              {Object.entries(groupedData).map(([groupLabel, rows]) => (
                <Fragment key={groupLabel}>
                  {groupLabel !== "null" && (
                    <tr className="bg-gray-100">
                      <td colSpan={4} className="border p-2 font-bold">
                        {groupLabel}
                      </td>
                    </tr>
                  )}

                  {rows.map((row, index) => (
                    <tr key={row.cr_id}>
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2">{row.ind_label}</td>
                      <td className="border p-2 items-center">
                        {row.cr_ind_id === 22 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="border p-1 rounded w-full"
                          >
                            <option value="">Сонгох</option>
                            <option value="1">СТОУС</option>
                            <option value="2">ЖДААН-ийн СТОУС</option>
                            <option value="3">УСНББОУС</option>
                          </select>
                        ) : row.cr_ind_id === 23 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="border p-1 rounded w-full"
                          >
                            <option value="">Сонгох</option>
                            <option value="1">Аккруэл суурь</option>
                            <option value="2">Тохируулсан аккруэл суурь</option>
                            <option value="3">Тохируулсан мөнгөн суурь</option>
                          </select>
                        ) : row.cr_ind_id === 24 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="border p-1 rounded w-full"
                          >
                            <option value="">Сонгох</option>
                            <option value="1">Нийтлэг зорилготой</option>
                            <option value="2">Тусгай зорилготой</option>
                          </select>
                        ) : row.cr_ind_id === 25 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="border p-1 rounded w-full"
                          >
                            <option value="">Сонгох</option>
                            <option value="1">Хувьцаа эзэмшигчид, ТУЗ</option>
                            <option value="2">Төрийн байгууллага</option>
                            <option value="3">Зээлдүүлэгч/Донор байгууллага</option>
                            <option value="4">Бусад</option>
                          </select>
                        ) : row.cr_ind_id === 26 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="border p-1 rounded w-full"
                          >
                            <option value="">Сонгох</option>
                            <option value="1">Үнэн зөв толилуулгын</option>
                            <option value="2">Нийцлийн</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`noti-${row.cr_id}`}
                                checked={row.cr_rate_value === "true"}
                                onChange={() => onRadioChange(row.cr_id, "true")}
                              />
                              Тийм
                            </label>

                            <label className="flex items-center gap-1">
                              <input
                                type="radio"
                                name={`noti-${row.cr_id}`}
                                checked={row.cr_rate_value === "false"}
                                onChange={() => onRadioChange(row.cr_id, "false")}
                              />
                              Үгүй
                            </label>
                          </div>
                        )}
                      </td>
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
                </Fragment>
              ))}

              {lastRowData.map((row) => (
                <tr key={row.cr_id}>
                  <td className="border p-2" colSpan={2}>
                    {row.ind_label}
                  </td>

                  <td className="border p-2" colSpan={2}>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`last-${row.cr_id}`}
                          checked={row.cr_rate_value === "1"}
                          onChange={() => onRadioChange(row.cr_id, "1")}
                        />
                        Хүлээн зөвшөөрөхүйц
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`last-${row.cr_id}`}
                          checked={row.cr_rate_value === "2"}
                          onChange={() => onRadioChange(row.cr_id, "2")}
                        />
                        Үл хүлээн зөвшөөрөхүйц
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
