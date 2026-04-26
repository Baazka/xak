"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import AuditRisk from "../components/AuditRisk";
import { MessageCircle, Printer } from "lucide-react";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  info_id: number;
  info_form_id: number;
  info_ind_id: number;
  ind_group_label: string;
  ind_label: string;
  info_ind_value: string | null;
};

export default function Form201({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(
          `/api/audit/form201_203?aud_id=${auditId}&form_list_id=${formListId}`
        );
        const result = await res.json();

        setData(Array.isArray(result.data) ? result.data : []);
        console.log(result.data, "result201");
        setFormId(result.form_id ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTableData();
  }, [auditId]);

  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (Object.keys(groupedData).length > 0) {
      setActiveTab(Object.keys(groupedData)[0]);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const info_data = data.map((row) => ({
        info_id: row.info_id,
        info_form_id: row.info_form_id,
        info_ind_id: row.info_ind_id,
        form_id: formId,
        info_ind_value: row.info_ind_value,
      }));

      const res = await fetchWithAuth(`/api/audit/form201_203/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          status_id: 1,
          info_data,
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

  const groupedData = (Array.isArray(data) ? data : []).reduce(
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

          <div className="mb-3 flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {Object.keys(groupedData).map((group) => (
              <button
                key={group}
                onClick={() => setActiveTab(group)}
                className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm ${
                  activeTab === group
                    ? "border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                {group === "null" ? "Бусад" : group}
              </button>
            ))}
          </div>

          <div className="space-y-3 rounded">
            <table className="w-full text-sm text-gray-800 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="w-10 border border-gray-200 p-2 text-left dark:border-gray-700">
                    №
                  </th>
                  <th className="border border-gray-200 p-2 text-left dark:border-gray-700">
                    Байгууллагын үйл ажиллагаа
                  </th>
                  <th className="w-2/3 border border-gray-200 p-2 text-left dark:border-gray-700">
                    Аудитад хамааралтай мэдээлэл
                  </th>
                </tr>
              </thead>

              <tbody>
                {groupedData[activeTab]?.length ? (
                  groupedData[activeTab].map((row, index) => (
                    <tr key={row.info_id} className="bg-white dark:bg-gray-900">
                      <td className="border border-gray-200 p-2 text-center dark:border-gray-700">
                        {index + 1}
                      </td>

                      <td className="border border-gray-200 p-2 dark:border-gray-700">
                        {row.ind_label}
                      </td>

                      <td className="border border-gray-200 p-2 dark:border-gray-700">
                        <textarea
                          value={row.info_ind_value ?? ""}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.info_id === row.info_id
                                  ? {
                                      ...r,
                                      info_ind_value: e.target.value,
                                    }
                                  : r
                              )
                            )
                          }
                          className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500 dark:text-gray-400">
                      Өгөгдөл байхгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <AuditRisk auditId={auditId} formListId={formListId} />
          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
