"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { Span } from "next/dist/trace";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  risk_id: number;
  op_form_id: number;
  risk_type_id: number;
  risk_type_name: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  risk_content: string;
  op_is_fraud: number;
  op_fraud_reason: string;
  op_is_control: number;
  op_genre: string | null;
  op_inspection_rate: string | null;
  op_effect_rate: string | null;
  op_is_material: number;
  op_is_impact: number;
};

export default function Form205({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [supVal, setSupVal] = useState<string>("");

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form205?aud_id=${auditId}`);
        const result = await res.json();

        setData(Array.isArray(result.data) ? result.data : []);
        setFormId(result.form_id ?? 0);
        setSupVal(result.formData.form_sup_value ?? "");
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

      const corpData = data;

      const res = await fetchWithAuth(`/api/audit/form206/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          status_id: 1,
          corpData,
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:border-gray-700 dark:disabled:from-gray-700 dark:disabled:to-gray-700"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>

          <div>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th
                    rowSpan={2}
                    className="w-1/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    №
                  </th>
                  <th
                    rowSpan={2}
                    className="w-2/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    Тодорхойлсон эрсдэл
                  </th>
                  <th
                    rowSpan={2}
                    className="w-1/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    Уламжлалт эсвэл Хяналтын эрсдэл эсэх
                  </th>
                  <th
                    colSpan={3}
                    className="border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center"
                  >
                    Эрсдэлийн үнэлгээ
                  </th>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Тохиолдох магадлал
                  </th>
                  <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Санхүүгийн тайланд үзүүлэх нөлөө
                  </th>
                  <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Дундаж үнэлгээ
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={row.op_form_id} className="bg-white dark:bg-gray-900">
                    <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200 flex items-center justify-center">
                      <textarea
                        readOnly
                        value={row.risk_content ?? ""}
                        className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                      />
                    </td>
                    <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      <select
                        value={row.op_genre ?? ""}
                        onChange={(e) => row.op_genre === e.target.value}
                        className="flex rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      >
                        <option value="">Сонгох</option>
                        <option value="1">Уламжлалт эрсдэл</option>
                        <option value="2">Хяналтын эрсдэл</option>
                      </select>
                    </td>
                    <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      <select
                        value={row.op_inspection_rate ?? ""}
                        onChange={(e) => row.op_inspection_rate === e.target.value}
                        className="rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      >
                        <option value="">Сонгох</option>
                        <option value="0.3">0.3 - Бага</option>
                        <option value="0.6">0.6 - Дунд</option>
                        <option value="0.9">0.9 - Их</option>
                      </select>
                    </td>
                    <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      <select
                        value={row.op_effect_rate ?? ""}
                        onChange={(e) => row.op_effect_rate === e.target.value}
                        className="rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      >
                        <option value="">Сонгох</option>
                        <option value="0.3">0.3 - Бага</option>
                        <option value="0.6">0.6 - Дунд</option>
                        <option value="0.9">0.9 - Их</option>
                      </select>
                    </td>
                    <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      <input
                        type="number"
                        readOnly
                        value={
                          row.op_genre +
                          " | " +
                          row.op_effect_rate +
                          " | " +
                          row.op_inspection_rate +
                          " | " +
                          (Number(row.op_inspection_rate) + Number(row.op_effect_rate)) / 2
                        }
                      ></input>
                    </td>
                  </tr>
                ))}
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      Уламжлалт эрсдэлийн ерөнхий үнэлгээ
                    </span>
                  </td>
                  <td
                    colSpan={2}
                    className="border border-gray-200 bg-gray-300 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    Уламжлалт Average
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      Хяналтын эрсдэлийн ерөнхий үнэлгээ
                    </span>
                  </td>
                  <td
                    colSpan={2}
                    className="border border-gray-200 bg-gray-300 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    Хяналт Average
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      Материаллаг буруу илэрхийллийн эрсдэлийн үнэлгээ
                    </span>
                  </td>
                  <td
                    colSpan={2}
                    className="border border-gray-200 bg-gray-300 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    МБИЭ Rate
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      Аудитын баталгааны түвшин болон эрсдэлийн хэмжээ
                    </span>
                  </td>
                  <td className="border border-gray-200 bg-gray-300 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <select
                      value={supVal}
                      onChange={(e) => setSupVal(e.target.value)}
                      className="rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="">Сонгох</option>
                      <option value="85">85%</option>
                      <option value="86">86%</option>
                      <option value="87">87%</option>
                      <option value="88">88%</option>
                      <option value="89">89%</option>
                      <option value="90">90%</option>
                      <option value="91">91%</option>
                      <option value="92">92%</option>
                      <option value="93">93%</option>
                      <option value="94">94%</option>
                      <option value="95">95%</option>
                      <option value="96">96%</option>
                      <option value="97">97%</option>
                      <option value="98">98%</option>
                      <option value="99">99%</option>
                    </select>
                  </td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {(100 - Number(supVal)) / 100}
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      Илрүүлэлтийн эрсдэлийн хэмжээ
                    </span>
                  </td>
                  <td
                    colSpan={2}
                    className="border border-gray-200 bg-gray-300 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    ИЭ Rate
                  </td>
                </tr>
              </tbody>
              {/* <tbody>
                {data
                  .filter((row) => row.corp_ind_id < 6)
                  .map((row, index) => (
                    <tr key={row.corp_id} className="bg-white dark:bg-gray-900">
                      <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {index + 1}
                      </td>
                      <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {row.corp_ind_label}
                      </td>
                      <td className="border border-gray-200 p-2 dark:border-gray-700">
                        <input
                          type="text"
                          placeholder="0.00"
                          value={row.corp_ind_value || ""}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.corp_id === row.corp_id
                                  ? { ...r, corp_ind_value: e.target.value }
                                  : r
                              )
                            )
                          }
                          className="w-full text-right rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                      </td>
                      <td className="border border-gray-200 p-2 dark:border-gray-700 text-right">
                        <span className="text-gray-700 dark:text-gray-200 pr-2">
                          {Number((Number(row.corp_ind_value) / 100) * 0.5).toLocaleString(
                            "en-US",
                            { maximumFractionDigits: 2, minimumFractionDigits: 2 }
                          )}
                        </span>
                      </td>
                      <td className="border border-gray-200 p-2 dark:border-gray-700 text-right">
                        <span className="text-gray-700 dark:text-gray-200 pr-2">
                          {Number((Number(row.corp_ind_value) / 100) * 2).toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="border border-gray-200 p-2 dark:border-gray-700 text-right">
                        <span className="text-gray-700 dark:text-gray-200 pr-2">
                          {Number(
                            (Number(row.corp_ind_value) / 100) *
                              Number(data.filter((row) => row.corp_ind_id === 6)[0].corp_ind_value)
                          ).toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody> */}
            </table>
          </div>
          {/* <div className="grid mt-3 grid-cols-2 gap-4">
            <div className="mb-0.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Сонгосон материаллаг байдлын суурь:
              </span>
              <select
                value={data.filter((row) => row.corp_ind_id === 7)[0].corp_ind_value ?? ""}
                onChange={(e) => {
                  const val1 = Number(
                    data.filter((row) => row.corp_ind_id === 1)[0].corp_ind_value ?? 0
                  );
                  const val2 = Number(
                    data.filter((row) => row.corp_ind_id === 2)[0].corp_ind_value ?? 0
                  );
                  const val3 = Number(
                    data.filter((row) => row.corp_ind_id === 3)[0].corp_ind_value ?? 0
                  );
                  const val4 = Number(
                    data.filter((row) => row.corp_ind_id === 4)[0].corp_ind_value ?? 0
                  );
                  const val5 = Number(
                    data.filter((row) => row.corp_ind_id === 5)[0].corp_ind_value ?? 0
                  );
                  const rate = Number(
                    data.filter((row) => row.corp_ind_id === 6)[0].corp_ind_value ?? 0
                  );
                  switch (e.target.value) {
                    case "1":
                      setData((prev) =>
                        prev.map((row) =>
                          row.corp_ind_id === 7
                            ? { ...row, corp_ind_value: e.target.value }
                            : row.corp_ind_id === 8
                              ? {
                                  ...row,
                                  corp_ind_value:
                                    (val1 / 100) * rate > 0 ? ((val1 / 100) * rate).toString() : "",
                                }
                              : row
                        )
                      );
                      break;
                    case "2":
                      setData((prev) =>
                        prev.map((row) =>
                          row.corp_ind_id === 7
                            ? { ...row, corp_ind_value: e.target.value }
                            : row.corp_ind_id === 8
                              ? {
                                  ...row,
                                  corp_ind_value:
                                    (val2 / 100) * rate > 0 ? ((val2 / 100) * rate).toString() : "",
                                }
                              : row
                        )
                      );
                      break;
                    case "3":
                      setData((prev) =>
                        prev.map((row) =>
                          row.corp_ind_id === 7
                            ? { ...row, corp_ind_value: e.target.value }
                            : row.corp_ind_id === 8
                              ? {
                                  ...row,
                                  corp_ind_value:
                                    (val3 / 100) * rate > 0 ? ((val3 / 100) * rate).toString() : "",
                                }
                              : row
                        )
                      );
                      break;
                    case "4":
                      setData((prev) =>
                        prev.map((row) =>
                          row.corp_ind_id === 7
                            ? { ...row, corp_ind_value: e.target.value }
                            : row.corp_ind_id === 8
                              ? {
                                  ...row,
                                  corp_ind_value:
                                    (val4 / 100) * rate > 0 ? ((val4 / 100) * rate).toString() : "",
                                }
                              : row
                        )
                      );
                      break;
                    default:
                      setData((prev) =>
                        prev.map((row) =>
                          row.corp_ind_id === 7 ? { ...row, corp_ind_value: e.target.value } : row
                        )
                      );
                      break;
                  }
                }}
                className="ml-2 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">Сонгох</option>
                <option value="1">Нийт орлого</option>
                <option value="2">Нийт зардал</option>
                <option value="3">Нийт хөрөнгө</option>
                <option value="4">Цэвэр хөрөнгө</option>
                <option value="5">Бусад</option>
              </select>
            </div>
            <div className="mb-0.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Тогтоосон материаллаг байдал:
              </span>
              <span className="ml-2 text-sm font-semibold bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                {Number(
                  data.filter((row) => row.corp_ind_id === 8)[0].corp_ind_value
                ).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) ??
                  0}
              </span>
            </div>
            <div className="mb-0.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Гүйцэтгэлийн материаллаг байдал тооцох хувь:
              </span>
              <select
                value={data.filter((row) => row.corp_ind_id === 9)[0].corp_ind_value ?? ""}
                onChange={(e) => {
                  const val8 =
                    Number(data.filter((row) => row.corp_ind_id === 8)[0].corp_ind_value ?? 0) ?? 0;
                  const percent = Number(e.target.value);
                  setData((prev) =>
                    prev.map((row) =>
                      row.corp_ind_id === 9
                        ? { ...row, corp_ind_value: e.target.value }
                        : row.corp_ind_id === 10
                          ? {
                              ...row,
                              corp_ind_value:
                                val8 * percent > 0 ? ((val8 / 100) * percent).toString() : "",
                            }
                          : row
                    )
                  );
                }}
                className="ml-2 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">Сонгох</option>
                <option value="60">60%</option>
                <option value="65">65%</option>
                <option value="70">70%</option>
                <option value="75">75%</option>
                <option value="80">80%</option>
              </select>
            </div>
            <div className="mb-0.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Гүйцэтгэлийн материаллаг байдал:
              </span>
              <span className="ml-2 text-sm font-semibold bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                {Number(
                  data.filter((row) => row.corp_ind_id === 10)[0].corp_ind_value
                ).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) ??
                  0}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <div className="m-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Тогтоосон материаллаг байдалтай холбоотой тайлбар:
              </span>
            </div>
            <div className="flex mb-1.5 rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
              <span className="w-1/7 p-2 border-r-1 border-gray-300 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Суурь үзүүлэлтийг сонгосон шалтгаан, тайлбар
              </span>
              <textarea
                value={data.filter((row) => row.corp_ind_id === 11)[0].corp_ind_value ?? ""}
                onChange={(e) =>
                  setData((prev) =>
                    prev.map((r) =>
                      r.corp_ind_id === 11 ? { ...r, corp_ind_value: e.target.value } : r
                    )
                  )
                }
                className="w-6/7 m-1 field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex mb-1.5 rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
              <span className="w-1/7 p-2 border-r-1 border-gray-300 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Хувь хэмжээ сонгосон шалтгаан, тайлбар
              </span>
              <textarea
                value={data.filter((row) => row.corp_ind_id === 12)[0].corp_ind_value ?? ""}
                onChange={(e) =>
                  setData((prev) =>
                    prev.map((r) =>
                      r.corp_ind_id === 12 ? { ...r, corp_ind_value: e.target.value } : r
                    )
                  )
                }
                className="w-6/7 m-1 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex mb-1.5 rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
              <span className="w-1/7 p-2 border-r-1 border-gray-300 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Материаллаг байдлыг шинж чанарын хувьд авч үзэх шалтгаан, тайлбар
              </span>
              <textarea
                value={data.filter((row) => row.corp_ind_id === 13)[0].corp_ind_value ?? ""}
                onChange={(e) =>
                  setData((prev) =>
                    prev.map((r) =>
                      r.corp_ind_id === 13 ? { ...r, corp_ind_value: e.target.value } : r
                    )
                  )
                }
                className="w-6/7 m-1 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex mb-1.5 rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
              <span className="w-1/7 p-2 border-r-1 border-gray-300 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Гүйцэтгэлийн материаллаг байдлын хувь хэмжээ сонгосон шалтгаан, тайлбар
              </span>
              <textarea
                value={data.filter((row) => row.corp_ind_id === 14)[0].corp_ind_value ?? ""}
                onChange={(e) =>
                  setData((prev) =>
                    prev.map((r) =>
                      r.corp_ind_id === 14 ? { ...r, corp_ind_value: e.target.value } : r
                    )
                  )
                }
                className="w-6/7 m-1 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          </div> */}

          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
