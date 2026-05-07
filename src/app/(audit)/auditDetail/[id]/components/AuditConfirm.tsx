"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";
import { StatusBadge } from "./AuditStatusBadge";
import SkeletonCard from "./SkeletonCard";

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
        <SkeletonCard />
      ) : (
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <h3 className="text-sm font-semibold tracking-wide text-gray-800 dark:text-gray-100">
                Баталгаажуулалт
              </h3>
            </div>

            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />

            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="group inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-800 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition group-hover:rotate-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Үйлдлийн түүх
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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onMouseDown={() => setDialogOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Маягтын үйлдлийн түүх
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Маягт дээр хийгдсэн үйлдлүүдийн жагсаалт
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="overflow-auto p-5">
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {["№", "Төлөв", "Хэрэглэгчийн нэр", "Огноо", "Утас", "Имэйл"].map((head) => (
                        <th
                          key={head}
                          className="border-b border-gray-200 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:border-gray-700 dark:text-gray-300"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {formLog.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                          Үйлдлийн түүх олдсонгүй.
                        </td>
                      </tr>
                    ) : (
                      formLog.map((item, index) => (
                        <tr
                          key={item.action_id}
                          className="transition hover:bg-gray-50 dark:hover:bg-gray-800/60"
                        >
                          <td className="px-3 py-3 text-center text-gray-500 dark:text-gray-400">
                            {index + 1}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <StatusBadge status={item.action_status_name} />
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-gray-800 dark:text-gray-100">
                            {item.user_firstname}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-300">
                            {item.action_date}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-300">
                            {item.user_phone}
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600 dark:text-gray-300">
                            {item.user_email}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
