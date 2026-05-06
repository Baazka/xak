"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import AuditConfirm from "../components/AuditConfirm";
import AuditComment from "../components/AuditComment";
import AuditFormSave from "./AuditFormSave";
import { useToast } from "@/context/ToastContext";

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
  formId: number;
  formSave: () => void;
  formSupValue?: string | null;
  formFileId?: number | null;
};

export default function FormActionSection({ formId, formSave, formSupValue, formFileId }: Props) {
  const [formData, setFormData] = useState<FormData>({
    form_id: 0,
    form_aud_id: 0,
    form_list_id: 0,
    form_stage: "",
    form_name: "",
    form_code: "",
    form_status_id: 0,
    form_status_name: "",
    form_status_code: "",
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [refresher, setRefresher] = useState(0);

  useEffect(() => {
    async function loadFormData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/audit_forms?form_id=${formId}`);

        if (!res.ok) {
          throw new Error(`formData татахад алдаа гарлаа (${res.status})`);
        }

        const result = await res.json();
        setFormData(result?.formData ?? null);
      } catch (error) {
        console.error("FormActionSection load error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!formId) {
      setLoading(false);
      return;
    }

    loadFormData();
  }, [formId, refresher]);

  const formProcess = async (form_id: number, form_status_id: number) => {
    try {
      const res = await fetchWithAuth(`/api/audit/audit_forms/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: form_id,
          form_status_id: form_status_id,
          form_description: formData.form_description,
          form_sup_value: formSupValue,
          form_file_id: formFileId,
        }),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }
      if (form_status_id !== 1) {
        toast("success", "Үйлдэл амжилттай хадгаллаа");
      }
    } catch (error) {
      console.error(error);
      toast("error", "Хадгалахад алдаа гарлаа");
    }
    setRefresher((r) => r + 1);
  };

  const formDataSave = async () => {
    formSave();
    formProcess(formData.form_id, 1);
  };

  return (
    <>
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <AuditFormSave formSave={formDataSave} formData={formData} formProcess={formProcess} />
            <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Тэмдэглэл
            </div>
            <textarea
              className="mt-1 min-h-[120px] w-full rounded border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400"
              value={formData.form_description ?? ""}
              onChange={(e) => setFormData({ ...formData, form_description: e.target.value })}
            />
          </div>

          <AuditConfirm formId={formId} />
          <AuditComment formId={formId} />
        </div>
      )}
    </>
  );
}
