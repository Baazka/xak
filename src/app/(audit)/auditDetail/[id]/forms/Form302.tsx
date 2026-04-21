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
  corp_id: number;
  corp_form_id: number;
  corp_ind_id: number;
  corp_ind_level: string;
  corp_ind_label: string;
  corp_ind_value: string | null;
};

type RiskType = {
  risk_id: number;
  risk_content: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  risk_cd_type_id: number;
  risk_cd_type_name: string;
  resp_main_type_id: number;
  resp_main_type_name: string;
  resp_rtype_id: number;
  resp_sub_rtype_id: number;
  resp_simple_type: string;
  resp_response: string;
  resp_standard_clause: string;
  resp_law_clause: string;
  risk_is_important: number;
};

export default function Form302({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [riskData, setRiskData] = useState<RiskType[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [isChange, setIsChange] = useState(false);

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form302?aud_id=${auditId}`);
        const result = await res.json();

        console.log("rslt", result);

        if (result.data.length === 0) {
          setData(Array.isArray(result.prevData) ? result.prevData : []);
          setIsChange(false);
        } else {
          setData(Array.isArray(result.data) ? result.data : []);
          setIsChange(true);
        }

        setRiskData(Array.isArray(result.riskData) ? result.riskData : []);

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

      const corpData = data;

      const res = await fetchWithAuth(`/api/audit/form302/`, {
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
          <div className="grid grid-cols-3 gap-2 mb-4 rounded border p-3 border-gray-200 dark:border-gray-800">
            <div className="grid direction-alternate items-start justify-baseline gap-3">
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Сонгосон материаллаг байдал:{" "}
                </span>
                <select
                  value={data.filter((row) => row.corp_ind_id === 6)[0].corp_ind_value ?? ""}
                  disabled={!isChange}
                  onChange={(e) =>
                    setData((prev) =>
                      prev.map((row) =>
                        row.corp_ind_id === 6 ? { ...row, corp_ind_value: e.target.value } : row
                      )
                    )
                  }
                  className="ml-2 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 disabled:bg-gray-200"
                >
                  <option value="">Сонгох</option>
                  <option value="0.5">0.5%</option>
                  <option value="1.0">1.0%</option>
                  <option value="1.5">1.5%</option>
                  <option value="2.0">2.0%</option>
                </select>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Сонгосон материаллаг байдлын суурь:
                </span>
                <select
                  value={data.filter((row) => row.corp_ind_id === 7)[0].corp_ind_value ?? ""}
                  disabled={!isChange}
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
                                      (val1 / 100) * rate > 0
                                        ? ((val1 / 100) * rate).toString()
                                        : "",
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
                                      (val2 / 100) * rate > 0
                                        ? ((val2 / 100) * rate).toString()
                                        : "",
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
                                      (val3 / 100) * rate > 0
                                        ? ((val3 / 100) * rate).toString()
                                        : "",
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
                                      (val4 / 100) * rate > 0
                                        ? ((val4 / 100) * rate).toString()
                                        : "",
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
                  className="ml-2 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 disabled:bg-gray-200"
                >
                  <option value="">Сонгох</option>
                  <option value="1">Нийт орлого</option>
                  <option value="2">Нийт зардал</option>
                  <option value="3">Нийт хөрөнгө</option>
                  <option value="4">Цэвэр хөрөнгө</option>
                  <option value="5">Бусад</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="mb-0.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Тогтоосон материаллаг байдал:
                </span>
                <span className="ml-2 text-sm font-semibold bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                  {Number(
                    data.filter((row) => row.corp_ind_id === 8)[0].corp_ind_value
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  }) ?? 0}
                </span>
              </div>
              <div className="mb-0.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Гүйцэтгэлийн материаллаг байдал тооцох хувь:
                </span>
                <select
                  value={data.filter((row) => row.corp_ind_id === 9)[0].corp_ind_value ?? ""}
                  disabled={!isChange}
                  onChange={(e) => {
                    const val8 =
                      Number(data.filter((row) => row.corp_ind_id === 8)[0].corp_ind_value ?? 0) ??
                      0;
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
                  className="ml-2 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 disabled:bg-gray-200"
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
                  ).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  }) ?? 0}
                </span>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center ">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Материаллаг байдлын шинэчлэн тогтоох эсэх: {isChange ? "Тийм" : "Үгүй"}
                </span>
                <input
                  type="checkbox"
                  checked={isChange}
                  onChange={() => setIsChange(!isChange)}
                  className="ml-2"
                />
              </div>
              {isChange && (
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Дахин тооцсон материаллаг байдал:
                  </span>
                  <input
                    type="number"
                    value={data.filter((row) => row.corp_ind_id === 11)[0].corp_ind_value ?? ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev.map((row) =>
                          row.corp_ind_id === 11 ? { ...row, corp_ind_value: e.target.value } : row
                        )
                      )
                    }
                    className="ml-2 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 disabled:bg-gray-200"
                  />
                </div>
              )}
              {isChange && (
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Дахин тооцсон гүйцэтгэлийн материаллаг байдал:
                  </span>
                  <input
                    type="number"
                    value={data.filter((row) => row.corp_ind_id === 11)[0].corp_ind_value ?? ""}
                    onChange={(e) =>
                      setData((prev) =>
                        prev.map((row) =>
                          row.corp_ind_id === 11 ? { ...row, corp_ind_value: e.target.value } : row
                        )
                      )
                    }
                    className="ml-2 rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 disabled:bg-gray-200"
                  />
                </div>
              )}
            </div>
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
                          disabled={!isChange}
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
                          className="w-full text-right rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 disabled:bg-gray-200"
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
          <div className="mt-3">
            <div className="mb-3 p-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Эрсдэлтэй АГАДҮТ-ын хувьд гүйцэтгэлийн материаллаг байдлыг тооцох
              </span>
            </div>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="w-1/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    №
                  </th>
                  <th className="w-23/100 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Тодорхойлсон эрсдэл
                  </th>
                  <th className="w-3/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Нөлөөлж буй АГАДҮТ
                  </th>
                  <th className="w-3/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Эх олонлогийн хэмжээ
                  </th>
                  <th className="w-3/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Материаллаг байдлын түвшин
                  </th>
                  <th className="w-3/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Материаллаг байдал
                  </th>
                  <th className="w-3/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Гүйцэтгэлийн материаллаг байдал тооцох хувь
                  </th>
                  <th className="w-3/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Гүйцэтгэлийн материаллаг байдал
                  </th>
                </tr>
              </thead>
              <tbody>
                {riskData.map((row, index) => (
                  <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                    <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      <textarea
                        readOnly
                        value={row.risk_content ?? ""}
                        className="rounded border border-gray-300 w-full field-sizing-content flex items-center justify-center h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
