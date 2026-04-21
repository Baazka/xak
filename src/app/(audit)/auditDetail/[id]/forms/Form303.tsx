"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  risk_id: number;
  risk_content: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  col_list_count: number;
  col_list_amount: number;
  col_heavy_count: number;
  col_heavy_amount: number;
  col_abnormal_count: number;
  col_abnormal_amount: number;
  col_abnormal_desc: string;
  col_rest_count: number;
  col_rest_amount: number;
  col_trust_level: number;

  col_total_count: number;
  col_total_amount: number;
  col_choose_type: number;
  col_fault_count: number;
  col_fault_amount: number;
  col_heavy_fcount: number;
  col_heavy_famount: number;
  col_abnormal_fcount: number;
  col_abnormal_famount: number;
  col_total_fcount: number;
  col_total_famount: number;
  col_fault_convert: number;
};

export default function Form303({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form303?aud_id=${auditId}`);
        const result = await res.json();

        console.log(result, "<====result303");
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

      const colData = data.map((row) => ({
        risk_id: row.risk_id,
        col_list_count: row.col_list_count,
        col_list_amount: row.col_list_amount,
        col_heavy_count: row.col_heavy_count,
        col_heavy_amount: row.col_heavy_amount,
        col_abnormal_count: row.col_abnormal_count,
        col_abnormal_amount: row.col_abnormal_amount,
        col_abnormal_desc: row.col_abnormal_desc,
        col_rest_count: row.col_rest_count,
        col_rest_amount: row.col_rest_amount,
        col_trust_level: row.col_trust_level,
        col_total_count: row.col_total_count,
        col_total_amount: row.col_total_amount,
        col_choose_type: row.col_choose_type,
        col_fault_count: row.col_fault_count,
        col_fault_amount: row.col_fault_amount,
        col_heavy_fcount: row.col_heavy_fcount,
        col_heavy_famount: row.col_heavy_famount,
        col_abnormal_fcount: row.col_abnormal_fcount,
        col_abnormal_famount: row.col_abnormal_famount,
        col_total_fcount: row.col_total_fcount,
        col_total_famount: row.col_total_famount,
        col_fault_convert: row.col_fault_convert,
      }));

      const res = await fetchWithAuth(`/api/audit/form303/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          form_status_id: 1,
          form_description: "desc",
          colData,
        }),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }

      toast("success", "Амжилттай хадгаллаа");
    } catch (error) {
      console.error(error);
      toast("error", "Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <>
          <div className="m-2 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Эрсдэлтэй АГАДҮТ-н түвшинд хэрэгжүүлэх түүврийн хэмжээг тодорхойлох
          </h2>
          <table className="w-full border-collapse text-sm mb-2">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Тодорхойлсон эрсдэл
                </th>
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Нөлөөлж буй АГАДҮТ
                </th>
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  АГАДҮТ-н дэд анги
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  А. Данс
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  В. Дангаараа нөлөө бүхий зүйлс
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Ердийн бус зүйлс
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Ердийн бус зүйлийн шинж чанарын тайлбар
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  D. Эх олонлогоос үлдсэн
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Ердийн бус зүйлийн шинж чанарын тайлбар
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Хяналтын найдвартай байдал
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Тооцоолсон түүврийн хэмжээ
                </th>
              </tr>
              <tr>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дүн
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                  <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {index + 1}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {row.risk_content}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {row.risk_group_name}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {row.risk_sub_group_name}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {row.risk_sub_group_name}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_list_count || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_list_count:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_list_amount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_list_amount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_heavy_count || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_heavy_count:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_heavy_amount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_heavy_amount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_abnormal_count || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_abnormal_count:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_abnormal_amount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_abnormal_amount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <textarea
                      value={row.col_abnormal_desc || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_abnormal_desc: e.target.value,
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_rest_count || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_rest_count:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_rest_amount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_rest_amount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <select
                      value={row.col_trust_level ?? ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_trust_level:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                    >
                      <option value="">Сонгох</option>
                      <option value="1">Найдвартай</option>
                      <option value="2">Дунд зэрэг</option>
                      <option value="3">Найдваргүй</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Эрсдэлтэй АГАДҮТ-н түвшинд хэрэгжүүлэх түүврийн сорилын үр дүн
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Тодорхойлсон эрсдэл
                </th>
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Нөлөөлж буй АГАДҮТ
                </th>
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  АГАДҮТ-н дэд анги
                </th>
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Тооцоолсон түүврийн хэмжээ
                </th>
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Тооцоолсон түүврийн үнэ цэнэ
                </th>
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Сонголт хийсэн арга
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Түүврийн алдаа
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Дангаараа нөлөө бүхий зүйлсийн алдаа
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Ердийн бус зүйлсийн алдаа
                </th>
                <th
                  colSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Нийт алдаа
                </th>

                <th
                  rowSpan={2}
                  className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  Харьцуулан шилжүүлсэн алдааны дүн
                </th>
              </tr>
              <tr>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дүн
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                  <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {index + 1}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {row.risk_content}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {row.risk_group_name}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {row.risk_sub_group_name}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {row.risk_sub_group_name}
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_total_count || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_total_count:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_total_amount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_total_amount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <select
                      value={row.col_choose_type ?? ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_choose_type:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                    >
                      <option value="">Сонгох</option>
                      <option value="1">Статистик</option>
                      <option value="2">Статистикийн бус</option>
                    </select>
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_fault_count || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_fault_count:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_fault_amount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_fault_amount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_heavy_fcount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_heavy_fcount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_heavy_famount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_heavy_famount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_abnormal_fcount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_abnormal_fcount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_abnormal_famount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_abnormal_famount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_total_fcount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_total_fcount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_total_famount || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_total_famount:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={row.col_fault_convert || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.risk_id === row.risk_id
                              ? {
                                  ...r,
                                  col_fault_convert:
                                    e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
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
