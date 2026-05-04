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

type FormLog = {
  action_id: number;
  action_form_id: number;
  action_status_id: number;
  action_status_name: string;
  action_date: string;
  action_by: number;
  user_firstname: string;
  user_phone: string;
  user_email: string;
  user_level_id: number;
  user_level_name: string;
  user_org_id: number;
  org_register_no: string;
  org_legal_name: string;
  role_id: number;
  role_label: string;
  role_code: string;
  role_level: number;
  role_text: string;
};

export default function AuditConfirm({ formId }: Props) {
  const [formConfirm, setFormConfirm] = useState<FormConfirm[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLog, setFormLog] = useState<FormLog[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function loadFormConfirmData() {
      try {
        setLoading(true);

        const resConfirm = await fetchWithAuth(
          `/api/audit/audit_forms/confirmation?form_id=${formId}`
        );
        const confirmResult = await resConfirm.json();

        setFormConfirm(Array.isArray(confirmResult?.confirm) ? confirmResult.confirm : []);

        const resLog = await fetchWithAuth(`/api/audit/audit_forms/formLog?form_id=${formId}`);
        const LogResult = await resLog.json();

        setFormLog(Array.isArray(LogResult?.data) ? LogResult.data : []);
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
            <h3 className="shrink-0 text-gray-800 dark:text-gray-100 text-sm font-semibold">
              Баталгаажуулалт
            </h3>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <button onClick={() => setDialogOpen(true)}>
              <h3 className="underline shrink-0 text-gray-600 dark:text-gray-100 text-sm hover:text-brand-700 dark:hover:text-brand-600 ">
                Үйлдлийн түүх
              </h3>
            </button>
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
      {dialogOpen && (
        <div
          className="fixed w-full inset-0 z-1000 flex items-center justify-center bg-black/40"
          onMouseDown={() => setDialogOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-lg max-h-10/12 overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Маягтын үйлдлийн түүх</h2>

              <button
                className="rounded px-2 py-1 hover:bg-gray-100"
                onClick={() => setDialogOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      №
                    </th>
                    <th className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Төлөв
                    </th>
                    <th className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Хэрэглэгчийн нэр
                    </th>
                    <th className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Огноо
                    </th>
                    <th className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Утас
                    </th>
                    <th className=" border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Имэйл
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formLog.map((item, index) => (
                    <tr key={item.action_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className=" border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {index + 1}
                      </td>
                      <td className=" border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {item.action_status_name}
                      </td>
                      <td className=" border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {item.user_firstname}
                      </td>
                      <td className=" border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {item.action_date}
                      </td>
                      <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {item.user_phone}
                      </td>
                      <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {item.user_email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
