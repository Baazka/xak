"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import { MessageCircle, Printer } from "lucide-react";
import { F306_DATA_MAP1, F306_DATA_MAP2, F306_DATA_MAP3 } from "@/utils/constSelect";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  risk_id: number;
  fc_form_id: number;
  risk_type_id: number;
  risk_type_name: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  risk_cd_type_id: number;
  risk_cd_type_name: string;
  risk_content: string;
  res_result: string;
  res_fault_level: number;
  rf_effect: string;
  rf_amount: number;
  rf_type_id: number;
  rf_is_material: number;
  rf_correctable: number;
  rf_standard_clause: string;
  rf_law_clause: string;

  fc_sub_type: number;
  fc_report_id: number;
  fc_report_name: string;
  fc_description_id: number;
  fc_description_name: string;
  fc_result: string;
  fc_comment: string;
  risk_is_important: number;
};

export default function Form306({ auditId, formListId }: Props) {
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

        const res = await fetchWithAuth(`/api/audit/form306?aud_id=${auditId}`);
        const result = await res.json();

        console.log(result, "<====result306");
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

      const correctionData = data.map((row) => ({
        risk_id: row.risk_id,
        fc_sub_type: row.fc_sub_type,
        fc_report_id: row.fc_report_id,
        fc_description_id: row.fc_description_id,
        fc_result: row.fc_result,
        fc_comment: row.fc_comment,
      }));

      const res = await fetchWithAuth(`/api/audit/form306/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          form_status_id: 1,
          form_description: "desc",
          correctionData,
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
            Эрсдэлтэй АГАДҮТ-н түвшинд хэрэгжүүлэх түүврийн сорилын алдааг үнэлэх
          </h2>
          <table className="w-full border-collapse text-sm mb-2">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="w-[30px] border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  №
                </th>
                <th className="w-1/6  border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тодорхойлсон эрсдэл
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Үр дагавар
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Мөнгөн дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Алдаа, зөрчлийн дэд анги
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Залруулга хийсэн тайлан
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Залруулга хийсэн тодруулга
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Стандартын заалт
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
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
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.risk_content ?? ""}
                        className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.rf_effect || ""}
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <input
                        readOnly
                        type="number"
                        value={row.rf_amount || ""}
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <select
                        value={row.fc_sub_type ?? ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    fc_sub_type: e.target.value === "" ? 0 : Number(e.target.value),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                      >
                        <option value="">Сонгох</option>
                        {Object.entries(F306_DATA_MAP1).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <select
                        value={row.fc_report_id ?? ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    fc_report_id:
                                      e.target.value === "" ? 0 : Number(e.target.value),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                      >
                        <option value="">Сонгох</option>
                        {Object.entries(F306_DATA_MAP2).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <select
                        value={row.fc_description_id ?? ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    fc_description_id:
                                      e.target.value === "" ? 0 : Number(e.target.value),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                      >
                        <option value="">Сонгох</option>
                        {Object.entries(F306_DATA_MAP3).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.rf_standard_clause || ""}
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.rf_law_clause || ""}
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Санхүүгийн тайлангийн түвшинд болон ач холбогдолтой биш эрсдэлүүдэд хэрэгжүүлэх горим,
            сорилын үр дүн үнэлэх
          </h2>
          <table className="w-full border-collapse text-sm mb-2">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="w-[30px] border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  №
                </th>
                <th className="w-1/6  border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тодорхойлсон эрсдэл
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Үр дагавар
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Мөнгөн дүн
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Залруулсан нөхцөл байдал
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тайлбар
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Стандартын заалт
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Хууль тогтоомжийн заалт
                </th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter((row) => !(row.risk_type_id === 2 && row.risk_is_important === 1))
                .map((row, index) => (
                  <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                    <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.risk_content ?? ""}
                        className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.rf_effect || ""}
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <input
                        readOnly
                        type="number"
                        value={row.rf_amount || ""}
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        value={row.fc_result || ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    fc_result: e.target.value,
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        value={row.fc_comment || ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    fc_comment: e.target.value,
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.rf_standard_clause || ""}
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.rf_law_clause || ""}
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <FormActionSection auditId={auditId} formId={formId} formListId={formListId} />
        </>
      )}
    </>
  );
}
