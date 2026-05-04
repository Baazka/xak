"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import { MessageCircle, Printer } from "lucide-react";
import { F206_DATA_MAP1, F206_DATA_MAP2, F206_DATA_MAP3 } from "@/utils/constSelect";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  corp_id: number;
  corp_form_id: number;
  corp_ind_id: number;
  corp_ind_level: string;
  corp_ind_label: string;
  corp_ind_value: string | null;
};

export default function Form206({ auditId, formListId }: Props) {
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

        const res = await fetchWithAuth(`/api/audit/form206?aud_id=${auditId}`);
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

      //   const corpData = data.map((row) => ({
      //     corp_id: row.corp_id,
      //     corp_ind_id: row.corp_ind_id,
      //     corp_ind_value: row.corp_ind_value,
      //   }));

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
          <div className="mb-2">
            {/* {data.map((row, index) => (
              <div key={row.corp_id} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {row.corp_ind_label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {row.corp_ind_id}
                </span>
              </div>
            ))} */}
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Сонгосон материаллаг байдал:{" "}
            </span>
            <select
              value={data.filter((row) => row.corp_ind_id === 6)[0].corp_ind_value ?? ""}
              onChange={(e) =>
                setData((prev) =>
                  prev.map((row) =>
                    row.corp_ind_id === 6 ? { ...row, corp_ind_value: e.target.value } : row
                  )
                )
              }
              className="ml-2 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Сонгох</option>
              {Object.entries(F206_DATA_MAP1).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th
                    colSpan={2}
                    rowSpan={2}
                    className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    Материаллаг байдлын суурь
                  </th>
                  <th
                    rowSpan={2}
                    className="w-1/8 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    Тайлант оны санхүүгийн тайлангийн дүн
                  </th>
                  <th
                    colSpan={2}
                    className="border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center"
                  >
                    Материаллаг байдлын түвшин
                  </th>
                  <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Сонгосон материаллаг байдлын түвшин
                  </th>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    0.5%
                  </th>
                  <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    2.0%
                  </th>
                  <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    {(data.filter((row) => row.corp_ind_id === 6)[0].corp_ind_value ?? "...") + "%"}
                  </th>
                </tr>
              </thead>
              <tbody>
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
              </tbody>
            </table>
          </div>
          <div className="grid mt-3 grid-cols-2 gap-4">
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
                {Object.entries(F206_DATA_MAP2).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
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
                {Object.entries(F206_DATA_MAP3).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
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
          </div>

          <FormActionSection auditId={auditId} formId={formId} formListId={formListId} />
        </>
      )}
    </>
  );
}
