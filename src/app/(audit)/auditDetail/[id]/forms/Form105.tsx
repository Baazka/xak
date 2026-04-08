"use client";

import DatePicker from "@/components/form/datePicker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";

type Props = {
  auditId: number;
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

  const normalData = data?.filter((row) => row.cr_ind_id !== 37);
  const lastRowData = data?.filter((row) => row.cr_ind_id === 37);

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
          <table className="w-full border-collapse border">
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
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{row.ind_label}</td>
                      <td className="border p-2">
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
                  <td className="border p-2"></td>
                  <td className="border p-2">{row.ind_label}</td>
                  <td className="border p-2">
                    <select
                      value={row.cr_rate_value ?? ""}
                      onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                      className="border p-1 rounded w-full"
                    >
                      <option value="">Сонгох</option>
                      <option value="1">Хүлээн зөвшөөрөхүйц</option>
                      <option value="2">Үл хүлээн зөвшөөрөхүйц</option>
                    </select>
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
