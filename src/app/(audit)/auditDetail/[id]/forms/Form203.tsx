"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useMemo, useState } from "react";
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
  ind_group_label: string | null;
  ind_label: string;
  info_ind_value: string | null;
};

export default function Form203({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");

  const { toast } = useToast();

  const FORCE_FIRST_TAB_IND_IDS = [87, 88, 89, 90, 91];

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(
          `/api/audit/form201_203?aud_id=${auditId}&form_list_id=${formListId}`
        );

        const result = await res.json();
        const rows = Array.isArray(result.data) ? result.data : [];

        setData(rows);
        setFormId(result.form_id ?? 0);

        setActiveTab((prev) => {
          if (prev) return prev;
          return rows.find((row: any) => row.ind_group_label)?.ind_group_label ?? "Бусад";
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTableData();
  }, [auditId, formListId]);

  const SPECIAL_TAB_KEY = "Хяналтын үйл ажиллагаа";
  const groupedData = useMemo(() => {
    const rows = Array.isArray(data) ? data : [];

    return rows.reduce(
      (acc, row) => {
        const isSpecial = FORCE_FIRST_TAB_IND_IDS.includes(Number(row.info_ind_id));

        const key = isSpecial ? SPECIAL_TAB_KEY : (row.ind_group_label ?? "Бусад");

        if (!acc[key]) acc[key] = [];
        acc[key].push(row);

        return acc;
      },
      {} as Record<string, TableRow[]>
    );
  }, [data]);

  const groupKeys = useMemo(() => Object.keys(groupedData), [groupedData]);

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

      if (!res.ok) throw new Error("Хадгалахад алдаа гарлаа");

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
                {activeTab === SPECIAL_TAB_KEY
                  ? Object.entries(
                      (groupedData[activeTab] ?? []).reduce(
                        (acc, row) => {
                          const key = row.ind_group_label ?? "Бусад";

                          if (!acc[key]) acc[key] = [];
                          acc[key].push(row);

                          return acc;
                        },
                        {} as Record<string, TableRow[]>
                      )
                    ).map(([groupLabel, rows]) => (
                      <Fragment key={groupLabel}>
                        <tr>
                          <td
                            colSpan={3}
                            className="border border-gray-200 p-2 dark:border-gray-700"
                          >
                            {groupLabel}
                          </td>
                        </tr>

                        {rows.map((row, index) => (
                          <tr key={row.info_id}>
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
                                        ? { ...r, info_ind_value: e.target.value }
                                        : r
                                    )
                                  )
                                }
                                className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400"
                              />
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))
                  : (groupedData[activeTab] ?? []).map((row, index) => (
                      <tr key={row.info_id}>
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
                                    ? { ...r, info_ind_value: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400"
                          />
                        </td>
                      </tr>
                    ))}
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
