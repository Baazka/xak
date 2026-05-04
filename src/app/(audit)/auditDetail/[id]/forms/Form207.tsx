"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { MessageCircle, Printer } from "lucide-react";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import { F207_DATA_MAP1, F207_DATA_MAP2 } from "@/utils/constSelect";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  risk_id: number;
  resp_form_id: number;
  risk_type_id: number;
  risk_type_name: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  risk_cd_type_id: number;
  risk_cd_type_name: string;
  risk_content: string;
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

export type RMainType = {
  main_type_id: number;
  main_type_label: string;
};

export default function Form207({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [rMainType, setRMainType] = useState<RMainType[]>([]);
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

        const resMainType = await fetchWithAuth("/api/audit/form207/meta");
        const resultMainType = await resMainType.json();

        setRMainType(resultMainType.response_main_type ?? []);

        const res = await fetchWithAuth(`/api/audit/form207?aud_id=${auditId}`);
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

      const respData = data;

      const res = await fetchWithAuth(`/api/audit/form207/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          form_status_id: 1,
          respData,
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
          <div className="mb-4">
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                A: Санхүүгийн тайлангийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн үнэлсэн
                эрсдэлд өгөх хариу
              </span>
            </div>
            <div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th
                      rowSpan={2}
                      className="w-1/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      №
                    </th>
                    <th
                      rowSpan={2}
                      className="w-1/4 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Тодорхойлсон эрсдэл
                    </th>
                    <th
                      rowSpan={2}
                      className="w-11/100 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Eрөнхий хариу үйлдэл
                    </th>
                    <th
                      rowSpan={2}
                      className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Гүйцэтгэх горим, сорил
                    </th>
                    <th
                      colSpan={2}
                      className="border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Шалгуур үзүүлэлт
                    </th>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Стандарт заалт
                    </th>
                    <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Хууль тогтоомжийн заалт
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter((row) => row.risk_type_id === 1)
                    .map((row, index) => (
                      <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                        <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          {index + 1}
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            readOnly
                            value={row.risk_content ?? ""}
                            className=" w-full field-sizing-content flex items-center justify-center h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <select
                            value={row.resp_main_type_id ?? ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_main_type_id: Number(e.target.value) }
                                    : r
                                )
                              )
                            }
                            className="whitespace-normal w-full rounded border border-gray-300 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          >
                            <option value="">Сонгох</option>
                            {rMainType.map((item) => (
                              <option key={item.main_type_id} value={item.main_type_id}>
                                {item.main_type_label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            value={row.resp_response || ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_response: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            value={row.resp_standard_clause || ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_standard_clause: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            value={row.resp_law_clause || ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_law_clause: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Б: Батламж мэдэгдлийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн үнэлсэн
                эрсдэлд өгөх хариу
              </span>
            </div>
            <div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th
                      rowSpan={2}
                      className="w-1/50 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      №
                    </th>
                    <th
                      rowSpan={2}
                      className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Тодорхойлсон эрсдэл
                    </th>
                    <th
                      rowSpan={2}
                      className="w-2/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      АГАДҮТ-ын дэд анги
                    </th>
                    <th
                      rowSpan={2}
                      className="w-2/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Холбогдох батламж мэдэгдэл
                    </th>
                    <th
                      rowSpan={2}
                      className="w-1/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Горимын шинж чанар
                    </th>
                    <th
                      rowSpan={2}
                      className="w-1/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Хэрэгжүүлэх горим, сорил
                    </th>
                    <th
                      rowSpan={2}
                      className="w-4/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Гүйцэтгэх горим, сорил
                    </th>
                    <th
                      colSpan={2}
                      className="border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                      Шалгуур үзүүлэлт
                    </th>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="w-13/100 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Стандарт заалт
                    </th>
                    <th className="w-13/100 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Хууль тогтоомжийн заалт
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter((row) => row.risk_type_id === 2 && row.risk_is_important === 1)
                    .map((row, index) => (
                      <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                        <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          {index + 1}
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            readOnly
                            value={row.risk_content ?? ""}
                            className=" w-full field-sizing-content flex items-center justify-center h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <span className="text-gray-700 dark:text-gray-200 text-center">
                            {row.risk_group_name} - {row.risk_sub_group_name}
                          </span>
                        </td>

                        <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <span className="text-gray-700 dark:text-gray-200 text-center">
                            {row.risk_cd_type_name}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <select
                            value={row.resp_rtype_id || 0}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_rtype_id: Number(e.target.value) }
                                    : r
                                )
                              )
                            }
                            className="w-full p-1 min-h-38px rounded border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          >
                            <option value={0}>Сонгоно уу</option>
                            {Object.entries(F207_DATA_MAP1).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <select
                            value={row.resp_sub_rtype_id || 0}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_sub_rtype_id: Number(e.target.value) }
                                    : r
                                )
                              )
                            }
                            className="w-full p-1 min-h-38px rounded border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          >
                            <option value={0}>Сонгоно уу</option>
                            {Object.entries(F207_DATA_MAP2[String(row.resp_rtype_id)] ?? {}).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              )
                            )}
                          </select>
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            value={row.resp_response ?? ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_response: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            value={row.resp_standard_clause ?? ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_standard_clause: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            value={row.resp_law_clause || ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_law_clause: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                В: Ач холбогдолтой биш эрсдэлийн үнэлсэн эрсдэлд өгөх хариу
              </span>
            </div>
            <div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="w-1/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      №
                    </th>
                    <th className="w-9/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Тодорхойлсон эрсдэл
                    </th>
                    <th className="w-3/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Хамгийн энгийн бие даасан горим
                    </th>
                    <th className="w-3/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Гүйцэтгэх горим, сорил
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter((row) => row.risk_type_id === 2 && row.risk_is_important === 0)
                    .map((row, index) => (
                      <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                        <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          {index + 1}
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            readOnly
                            value={row.risk_content ?? ""}
                            className=" w-full field-sizing-content flex items-center justify-center h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            value={row.resp_simple_type ?? ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_simple_type: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <textarea
                            value={row.resp_response ?? ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === row.risk_id
                                    ? { ...r, resp_response: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <FormActionSection auditId={auditId} formId={formId} formListId={formListId} />
        </>
      )}
    </>
  );
}
