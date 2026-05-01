"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import AuditRisk from "../components/AuditRisk";
import { MessageCircle, Printer } from "lucide-react";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import {
  CR105_RATE_MAP1,
  CR105_RATE_MAP2,
  CR105_RATE_MAP3,
  CR105_RATE_MAP4,
  CR105_RATE_MAP5,
} from "@/utils/constSelect";
import { useToast } from "@/context/ToastContext";

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
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();
  const { toast } = useToast();

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

      toast("success", "Амжилттай хадгаллаа");
    } catch (error) {
      console.error(error);
      toast("error", "Хадгалахад алдаа гарлаа");
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

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="w-10 border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  №
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Үзүүлэлт
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Үнэлгээ
                </th>
                <th className="w-2/3 border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тайлбар
                </th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(groupedData).map(([groupLabel, rows]) => (
                <Fragment key={groupLabel}>
                  {groupLabel !== "null" && (
                    <tr className="bg-gray-100 dark:bg-gray-800/80">
                      <td
                        colSpan={4}
                        className="border border-gray-200 p-2 font-bold text-gray-800 dark:border-gray-700 dark:text-gray-100"
                      >
                        {groupLabel}
                      </td>
                    </tr>
                  )}

                  {rows.map((row, index) => (
                    <tr key={row.cr_id} className="bg-white dark:bg-gray-900">
                      <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {index + 1}
                      </td>

                      <td className="border border-gray-200 p-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {row.ind_label}
                      </td>

                      <td className="border border-gray-200 p-2 text-center dark:border-gray-700">
                        {row.cr_ind_id === 22 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="w-full rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                          >
                            <option value="">Сонгох</option>
                            {Object.entries(CR105_RATE_MAP1).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : row.cr_ind_id === 23 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="w-full rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                          >
                            <option value="">Сонгох</option>
                            {Object.entries(CR105_RATE_MAP2).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : row.cr_ind_id === 24 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="w-full rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                          >
                            <option value="">Сонгох</option>
                            {Object.entries(CR105_RATE_MAP3).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : row.cr_ind_id === 25 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="w-full rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                          >
                            <option value="">Сонгох</option>
                            {Object.entries(CR105_RATE_MAP4).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : row.cr_ind_id === 26 ? (
                          <select
                            value={row.cr_rate_value ?? ""}
                            onChange={(e) => onSelectChange(row.cr_id, e.target.value)}
                            className="w-full rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                          >
                            <option value="">Сонгох</option>
                            {Object.entries(CR105_RATE_MAP5).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex items-center justify-center gap-4 text-gray-700 dark:text-gray-200">
                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`noti-${row.cr_id}`}
                                checked={row.cr_rate_value === "true"}
                                onChange={() => onRadioChange(row.cr_id, "true")}
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Тийм
                            </label>

                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`noti-${row.cr_id}`}
                                checked={row.cr_rate_value === "false"}
                                onChange={() => onRadioChange(row.cr_id, "false")}
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Үгүй
                            </label>
                          </div>
                        )}
                      </td>

                      <td className="border border-gray-200 p-2 dark:border-gray-700">
                        <textarea
                          value={row.cr_description || ""}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.cr_id === row.cr_id ? { ...r, cr_description: e.target.value } : r
                              )
                            )
                          }
                          className="w-full rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}

              {lastRowData.map((row) => (
                <tr key={row.cr_id} className="bg-white dark:bg-gray-900">
                  <td
                    className="border border-gray-200 p-2 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                    colSpan={2}
                  >
                    {row.ind_label}
                  </td>

                  <td className="border border-gray-200 p-2 dark:border-gray-700" colSpan={2}>
                    <div className="flex items-center gap-6 text-gray-700 dark:text-gray-200">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={`last-${row.cr_id}`}
                          checked={row.cr_rate_value === "1"}
                          onChange={() => onRadioChange(row.cr_id, "1")}
                          className="accent-blue-600 dark:accent-blue-400"
                        />
                        Хүлээн зөвшөөрөхүйц
                      </label>

                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name={`last-${row.cr_id}`}
                          checked={row.cr_rate_value === "2"}
                          onChange={() => onRadioChange(row.cr_id, "2")}
                          className="accent-blue-600 dark:accent-blue-400"
                        />
                        Үл хүлээн зөвшөөрөхүйц
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <AuditRisk auditId={auditId} formListId={formListId} />
          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
