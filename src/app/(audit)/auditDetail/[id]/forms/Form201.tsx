"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useMemo, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import AuditRisk from "../components/AuditRisk";
import { useToast } from "@/context/ToastContext";
import SkeletonCard from "../components/SkeletonCard";

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(
          `/api/audit/form201_203?aud_id=${auditId}&form_list_id=${formListId}`
        );
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
          form_id: formId,
          info_data,
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

  const groupedData = useMemo(() => {
    return (Array.isArray(data) ? data : []).reduce(
      (acc, row) => {
        const key = row.ind_group_label ?? "null";

        if (!acc[key]) acc[key] = [];
        acc[key].push(row);

        return acc;
      },
      {} as Record<string, TableRow[]>
    );
  }, [data]);

  const groupKeys = useMemo(() => Object.keys(groupedData), [groupedData]);

  useEffect(() => {
    if (!activeTab && groupKeys.length > 0) {
      setActiveTab(groupKeys[0]);
    }
  }, [activeTab, groupKeys]);

  return (
    <>
      {loading ? (
        <SkeletonCard />
      ) : (
        <>
          <div className="mb-3 flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {groupKeys.map((group) => (
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
                {group === "null" ? "Бусад" : group}
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
          <FormActionSection formId={formId} formSave={handleSave} />
        </>
      )}
    </>
  );
}
