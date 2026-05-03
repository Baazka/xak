"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { MessageCircle, Printer } from "lucide-react";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import { F303_DATA_MAP1, F303_DATA_MAP2 } from "@/utils/constSelect";
import { formatCurrency } from "@/lib/formatCurrency";

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
  rc_exec_amount: number;
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
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();
  const { toast } = useToast();

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form303?aud_id=${auditId}`);
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

  const calcRestCount = (row: TableRow) =>
    Number(row.col_list_count || 0) -
    Number(row.col_heavy_count || 0) -
    Number(row.col_abnormal_count || 0);

  const calcRestAmount = (row: TableRow) =>
    Number(row.col_list_amount || 0) -
    Number(row.col_heavy_amount || 0) -
    Number(row.col_abnormal_amount || 0);

  const calcTotalCount = (row: TableRow) =>
    (
      (calcRestAmount(row) * Number(row.col_trust_level)) /
      Number(row.rc_exec_amount || 1)
    ).toFixed();

  const calcTotalFCount = (row: TableRow) =>
    Number(row.col_fault_count || 0) +
    Number(row.col_heavy_fcount || 0) +
    Number(row.col_abnormal_fcount || 0);

  const calcTotalFAmount = (row: TableRow) =>
    Number(row.col_fault_amount || 0) +
    Number(row.col_heavy_famount || 0) +
    Number(row.col_abnormal_famount || 0);
  const calcFaultConvert = (row: TableRow) =>
    (
      (Number(row.col_list_amount) / Number(row.col_total_amount || 1)) *
      calcTotalFAmount(row)
    ).toFixed();

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
        col_rest_count: calcRestCount(row),
        col_rest_amount: calcRestAmount(row),

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
          <div className="flex items-center justify-end gap-2 mb-2">
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
            <button
              type="button"
              onClick={() => openHelp({ audId: auditId, formId: formListId })}
              className="inline-flex h-10 items-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              title="Тусламж"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handlePrint("portrait")}
              className="inline-flex h-10 items-center rounded-lg bg-slate-700 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
              title="Хэвлэх"
            >
              <Printer className="w-4 h-4" />
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
                  №
                </th>
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
                  Гүйцэтгэлийн материаллаг байдал
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
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
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
                    {formatCurrency(row.rc_exec_amount)}
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
                      value={calcRestCount(row)}
                      readOnly
                      className="w-full rounded border border-gray-300 bg-gray-100 p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={calcRestAmount(row)}
                      readOnly
                      className="w-full rounded border border-gray-300 bg-gray-100 p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                    >
                      <option value="">Сонгох</option>
                      {Object.entries(F303_DATA_MAP1).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={calcTotalCount(row)}
                      readOnly
                      className="w-full rounded border border-gray-300 bg-gray-100 p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
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
                  №
                </th>
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
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]"
                >
                  Тооцоолсон түүврийн хэмжээ
                </th>
                <th
                  rowSpan={2}
                  className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]"
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
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100  w-[80px]">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
                  Тоо
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 w-[80px]">
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
                    <input
                      type="number"
                      value={calcTotalCount(row)}
                      readOnly
                      className="w-full rounded border border-gray-300 bg-gray-100 p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
                      {Object.entries(F303_DATA_MAP2).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
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
                      value={calcTotalFCount(row)}
                      readOnly
                      className="w-full rounded border border-gray-300 bg-gray-100 p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={calcTotalFAmount(row)}
                      readOnly
                      className="w-full rounded border border-gray-300 bg-gray-100 p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />
                  </td>
                  <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      value={calcFaultConvert(row)}
                      readOnly
                      className="w-full rounded border border-gray-300 bg-gray-100 p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
