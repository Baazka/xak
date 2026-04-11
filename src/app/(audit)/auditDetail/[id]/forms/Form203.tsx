"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import AuditRisk from "../components/AuditRisk";

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

export default function Form203({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        <div>Уншиж байна...</div>
      ) : (
        <>
          <div className="m-2 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
          <div className="flex gap-2 border-b mb-3 overflow-x-auto">
            {Object.keys(groupedData).map((group) => (
              <button
                key={group}
                onClick={() => setActiveTab(group)}
                className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 ${
                  activeTab === group
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500"
                }`}
              >
                {group === "null" ? "Бусад" : group}
              </button>
            ))}
          </div>
          <div className="space-y-3 rounded">
            <table className="w-full text-sm ">
              <thead>
                <tr>
                  <th className="border p-2 text-left w-10">№</th>
                  <th className="border p-2 text-left">Байгууллагын үйл ажиллагаа</th>
                  <th className="border p-2 text-left w-2/3">Аудитад хамааралтай мэдээлэл</th>
                </tr>
              </thead>

              <tbody>
                {groupedData[activeTab]?.length ? (
                  groupedData[activeTab].map((row, index) => (
                    <tr key={row.info_id}>
                      <td className="border p-2 text-center">{index + 1}</td>

                      <td className="border p-2">{row.ind_label}</td>

                      <td className="border p-2">
                        <textarea
                          value={row.info_ind_value || ""}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.info_id === row.info_id
                                  ? { ...r, info_ind_value: e.target.value }
                                  : r
                              )
                            )
                          }
                          className="w-full border rounded p-1"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center p-6 text-gray-400">
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
