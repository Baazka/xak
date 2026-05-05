"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import AuditConfirm from "../components/AuditConfirm";
import AuditComment from "../components/AuditComment";

type FormData = {
  form_id: number;
  form_aud_id: number;
  form_list_id: number;
  form_stage: string;
  form_name: string;
  form_code: string;
  form_status_id: number;
  form_status_name: string;
  form_status_code: string;
  form_description?: string | null;
  form_sup_value?: string | null;
  form_file_id?: number | null;
};

type Props = {
  auditId: number;
  formId: number;
  formListId: number;
  changeDesc: (value: string) => void;
  formDataProps: FormData;
  formSave: () => void;
};

export default function FormActionSection({
  auditId,
  formId,
  formListId,
  changeDesc,
  formDataProps,
  formSave,
}: Props) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadFormData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(
          `/api/audit/audit_forms?aud_id=${auditId}&formlist_id=${formListId}`
        );

        if (!res.ok) {
          throw new Error(`formData татахад алдаа гарлаа (${res.status})`);
        }

        const result = await res.json();
        setFormData(result?.formData ?? null);
      } catch (error) {
        console.error("FormActionSection load error:", error);
        setFormData(null);
      } finally {
        setLoading(false);
      }
    }

    if (!auditId || !formId) {
      setLoading(false);
      return;
    }

    loadFormData();
  }, [auditId, formId]);

  const handleSaveDescription = async () => {
    if (!auditId || !formId) {
      alert("auditId эсвэл formId буруу байна");
      return;
    }

    try {
      setSaving(true);

      const res = await fetchWithAuth("/api/audit/audit_forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form_id: formId,
          form_status_id: 1,
          form_description: formData?.form_description ?? "",
          form_sup_value: formData?.form_sup_value ?? "",
          form_file_id: formData?.form_file_id ?? "",
        }),
      });

      if (!res.ok) {
        throw new Error("Ажилбар хадгалахад алдаа гарлаа");
      }

      alert("Тайлбар амжилттай хадгаллаа");
    } catch (error) {
      console.error("FormActionSection save error:", error);
      alert("Тайлбар хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Тэмдэглэл
            </div>

            <textarea
              className="mt-1 min-h-[120px] w-full rounded border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400"
              value={formDataProps?.form_description ?? ""}
              onChange={(e) =>
                //setFormData((prev) => (prev ? { ...prev, form_description: e.target.value } : null))
                changeDesc(e.target.value)
              }
            />

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={formSave}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
                )}
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>

          <AuditConfirm formId={formId} />
          <AuditComment formId={formId} />
        </div>
      )}
    </>
  );
}
