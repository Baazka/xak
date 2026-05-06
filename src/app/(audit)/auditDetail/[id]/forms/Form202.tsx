"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useMemo, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { formatCurrency } from "@/lib/formatCurrency";
import { MessageCircle, Printer } from "lucide-react";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import { useToast } from "@/context/ToastContext";
type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  fs_id: number;
  fs_aud_id: number;
  fs_form_id: number;
  fs_ind_id: number;
  ind_group_id: number;
  ind_group_label: string;
  ind_label: string;
  ind_code: string;
  fs_val1: string | null;
  fs_val2: string | null;
};

export default function Form202({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();
  const { toast } = useToast();

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form202?aud_id=${auditId}`);
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

  const groupedData = useMemo(() => {
    return data.reduce(
      (acc, row) => {
        const key = row.ind_group_label ?? "Бусад";
        if (!acc[key]) acc[key] = [];
        acc[key].push(row);
        return acc;
      },
      {} as Record<string, TableRow[]>
    );
  }, [data]);

  const tabList = useMemo(() => Object.keys(groupedData), [groupedData]);

  useEffect(() => {
    if (tabList.length > 0 && !tabList.includes(activeTab)) {
      setActiveTab(tabList[0]);
    }
  }, [tabList, activeTab]);

  const currentRows = groupedData[activeTab] ?? [];

  const handleChange = (fsId: number, field: "fs_val1" | "fs_val2", value: string) => {
    setData((prev) => prev.map((row) => (row.fs_id === fsId ? { ...row, [field]: value } : row)));
  };

  const calcDiff = (val1: string | null, val2: string | null) => {
    const n1 = Number(val1 ?? 0);
    const n2 = Number(val2 ?? 0);
    if (Number.isNaN(n1) || Number.isNaN(n2)) return "";
    return n1 - n2;
  };

  const calcPercent = (val1: string | null, val2: string | null) => {
    const n1 = Number(val1 ?? 0);
    const n2 = Number(val2 ?? 0);

    if (Number.isNaN(n1) || Number.isNaN(n2) || n2 === 0) return "";
    return (((n1 - n2) / n2) * 100).toFixed(2);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const finstate_data = data.map((row) => ({
        fs_id: row.fs_id,
        fs_ind_id: row.fs_ind_id,
        fs_val1: row.fs_val1,
        fs_val2: row.fs_val2,
      }));

      const res = await fetchWithAuth(`/api/audit/form202/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formId,
          finstate_data,
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
          <div className="mb-3 flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {tabList.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setActiveTab(group)}
                className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm ${
                  activeTab === group
                    ? "border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
          <div className="hidden print:block text-sm font-semibold text-gray-800 dark:text-gray-100">
            {activeTab}
          </div>
          <div className="space-y-3 rounded">
            <table className="w-full text-sm text-gray-800 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="w-10 border border-gray-200 p-2 text-left dark:border-gray-700">
                    №
                  </th>
                  <th className="border border-gray-200 p-2 text-left dark:border-gray-700">
                    Үзүүлэлт
                  </th>
                  <th className="w-1/9 border border-gray-200 p-2 text-left dark:border-gray-700">
                    20xx.12.31
                  </th>
                  <th className="w-1/9 border border-gray-200 p-2 text-left dark:border-gray-700">
                    20xx.01.01
                  </th>
                  <th className="w-1/9 border border-gray-200 p-2 text-left dark:border-gray-700">
                    Зөрүү дүн
                  </th>
                  <th className="w-1/9 border border-gray-200 p-2 text-left dark:border-gray-700">
                    Зөрүү хувь
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((row, index) => {
                    const diff = calcDiff(row.fs_val1, row.fs_val2);
                    const percent = calcPercent(row.fs_val1, row.fs_val2);

                    return (
                      <tr key={row.fs_id} className="bg-white dark:bg-gray-900">
                        <td className="border border-gray-200 p-2 text-center dark:border-gray-700">
                          {index + 1}
                        </td>

                        <td className="border border-gray-200 p-2 dark:border-gray-700">
                          {row.ind_label}
                        </td>

                        <td className="border border-gray-200 p-2 dark:border-gray-700">
                          <input
                            type="text"
                            value={
                              editingKey === `${row.fs_id}-fs_val1`
                                ? (row.fs_val1 ?? "")
                                : formatCurrency(row.fs_val1)
                            }
                            onFocus={() => setEditingKey(`${row.fs_id}-fs_val1`)}
                            onBlur={(e) => {
                              setEditingKey(null);
                              const raw = e.target.value.replace(/,/g, "");
                              handleChange(row.fs_id, "fs_val1", raw);
                            }}
                            onChange={(e) =>
                              handleChange(row.fs_id, "fs_val1", e.target.value.replace(/,/g, ""))
                            }
                            className="w-full text-right rounded border border-gray-300 bg-white p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400"
                          />
                        </td>

                        <td className="border border-gray-200 p-2 dark:border-gray-700">
                          <input
                            type="text"
                            value={
                              editingKey === `${row.fs_id}-fs_val2`
                                ? (row.fs_val2 ?? "")
                                : formatCurrency(row.fs_val2)
                            }
                            onFocus={() => setEditingKey(`${row.fs_id}-fs_val2`)}
                            onBlur={(e) => {
                              setEditingKey(null);
                              const raw = e.target.value.replace(/,/g, "");
                              handleChange(row.fs_id, "fs_val2", raw);
                            }}
                            onChange={(e) =>
                              handleChange(row.fs_id, "fs_val2", e.target.value.replace(/,/g, ""))
                            }
                            className="w-full text-right rounded border border-gray-300 bg-white p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400"
                          />
                        </td>

                        <td className="border border-gray-200 p-2 dark:border-gray-700 text-right">
                          {formatCurrency(diff)}
                        </td>

                        <td className="border border-gray-200 p-2 dark:border-gray-700 text-right">
                          {percent === "" ? "" : `${percent}%`}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500 dark:text-gray-400">
                      Өгөгдөл байхгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <FormActionSection formId={formId} formSave={handleSave} />
        </>
      )}
    </>
  );
}
