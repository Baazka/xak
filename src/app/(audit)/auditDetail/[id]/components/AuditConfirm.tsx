"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";

type Props = {
  formId: number;
};

type FormConfirm = {
  action_id: number;
  action_form_id: number;
  action_status_id: number;
  action_status_name: string;
  action_date: string;
  action_by: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
};

export default function AuditConfirm({ formId }: Props) {
  const [formConfirm, setFormConfirm] = useState<FormConfirm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFormConfirmData() {
      try {
        setLoading(true);

        const resConfirm = await fetchWithAuth(
          `/api/audit/audit_forms/confirmation?form_id=${formId}`
        );
        const confirmResult = await resConfirm.json();

        setFormConfirm(Array.isArray(confirmResult?.confirm) ? confirmResult.confirm : []);
      } catch (err) {
        console.error(err);
        setFormConfirm([]);
      } finally {
        setLoading(false);
      }
    }

    if (formId) {
      loadFormConfirmData();
    } else {
      setFormConfirm([]);
      setLoading(false);
    }
  }, [formId]);

  return (
    <>
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-3">
            <h3 className="shrink-0 text-gray-800 dark:text-gray-100">Баталгаажуулалт</h3>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          {formConfirm.length === 0 ? (
            <div className="rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              Мэдээлэл алга
            </div>
          ) : (
            <div className="space-y-2">
              {formConfirm.map((item) => (
                <div
                  key={item.action_id}
                  className="rounded border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-[120px] text-gray-700 dark:text-gray-300">
                      {item.action_status_name}:
                    </div>

                    <div className="min-w-[220px] border-b border-gray-300 pb-1 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                      {item.user_firstname || ""}
                    </div>

                    <div className="text-gray-700 dark:text-gray-300">Огноо:</div>
                    <div className="min-w-[170px] border-b border-gray-300 pb-1 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                      {item.action_date || ""}
                    </div>

                    <div className="text-gray-700 dark:text-gray-300">Утас:</div>
                    <div className="min-w-[140px] border-b border-gray-300 pb-1 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                      {item.user_phone || ""}
                    </div>

                    <div className="text-gray-700 dark:text-gray-300">Имэйл:</div>
                    <div className="min-w-[150px] border-b border-gray-300 pb-1 text-gray-900 dark:border-gray-600 dark:text-gray-100">
                      {item.user_email || ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
