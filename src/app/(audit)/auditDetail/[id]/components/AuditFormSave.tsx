"use client";
import { useEffect, useState } from "react";
import { usePrint } from "@/hooks/usePrint";

import { ShootingStarIcon, EyeIcon, BoltIcon, CheckCircleIcon, ErrorIcon } from "@/icons";
import { MessageCircle, Printer } from "lucide-react";

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
  formListId: number;
  formSave: () => void;
  helpOpen?: () => void;
  formData: FormData;
  formProcess: (form_id: number, form_status_id: number) => void;
};

export default function AuditFormSave({ formSave, helpOpen, formData, formProcess }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmStatusId, setConfirmStatusId] = useState(0);
  const { handlePrint } = usePrint();
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);

  const saveForm = async () => {
    setSaving(true);
    try {
      await formSave();
    } finally {
      setSaving(false);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await formProcess(formData.form_id, confirmStatusId);
    } finally {
      setProcessing(false);
      setConfirmOpen(false);
    }
  };

  const handleStatus = async (form_status_id: number) => {
    setConfirmOpen(true);
    setConfirmStatusId(form_status_id);
  };

  return (
    <>
      <div className="fixed top-48 z-1 right-15 flex items-center justify-end gap-2 mb-2">
        <div>
          <button className="mr-4 rounded border p-2 bg-gray-200 border-gray-200">
            Маягтын төлөв: {formData?.form_status_name}
          </button>
        </div>
        {formData.form_status_id === 5 && (
          <button
            type="button"
            onClick={saveForm}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-linear-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
            )}
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        )}
        {formData.form_status_id === 1 && (
          <>
            <button
              type="button"
              onClick={() => handleStatus(2)}
              disabled={processing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-500 bg-linear-to-b from-amber-600 to-amber-700 px-5 text-sm font-semibold text-white shadow transition hover:from-amber-700 hover:to-amber-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
            >
              <ShootingStarIcon className="w-4 h-4" />
              {processing && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
              )}
              {processing ? "Илгээж байна..." : "Илгээх"}
            </button>

            <button
              type="button"
              onClick={saveForm}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-linear-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </>
        )}
        {formData.form_status_id === 2 && (
          <>
            <button
              type="button"
              onClick={() => handleStatus(3)}
              disabled={processing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-b-cyan-600 bg-linear-to-b from-cyan-600 to-cyan-700 px-5 text-sm font-semibold text-white shadow transition hover:from-cyan-700 hover:to-cyan-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
            >
              <EyeIcon className="w-4 h-4" />
              {processing && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
              )}
              {processing ? "Хянасан..." : "Хянасан"}
            </button>

            <button
              type="button"
              onClick={() => handleStatus(5)}
              disabled={processing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-b-error-500 bg-linear-to-b from-error-600 to-error-700 px-5 text-sm font-semibold text-white shadow transition hover:from-error-700 hover:to-error-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
            >
              <ErrorIcon className="w-4 h-4" />
              {processing && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
              )}
              {processing ? "Буцааж байна..." : "Буцаах"}
            </button>
          </>
        )}
        {formData.form_status_id === 3 && (
          <>
            <button
              type="button"
              onClick={() => handleStatus(4)}
              disabled={processing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-b-emerald-600 bg-linear-to-b from-emerald-600 to-emerald-700 px-5 text-sm font-semibold text-white shadow transition hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
            >
              <BoltIcon className="w-4 h-4" />
              {processing && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
              )}
              {processing ? "Батлаж байна..." : "Батлах"}
            </button>

            <button
              type="button"
              onClick={() => handleStatus(5)}
              disabled={processing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-b-error-500 bg-linear-to-b from-error-600 to-error-700 px-5 text-sm font-semibold text-white shadow transition hover:from-error-700 hover:to-error-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
            >
              <ErrorIcon className="w-4 h-4" />
              {processing && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
              )}
              {processing ? "Буцааж байна..." : "Буцаах"}
            </button>
          </>
        )}
        {formData.form_status_id === 4 && (
          <button
            type="button"
            onClick={() => handleStatus(6)}
            disabled={processing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-b-emerald-600 bg-linear-to-b from-emerald-600 to-emerald-700 px-5 text-sm font-semibold text-white shadow transition hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
          >
            <BoltIcon className="w-4 h-4" />
            {processing && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
            )}
            {processing ? "Хадгалж байна..." : "Чанарын хяналт"}
          </button>
        )}
        {formData.form_status_id === 6 && (
          <button
            type="button"
            onClick={() => handleStatus(7)}
            disabled={processing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-b-emerald-600 bg-linear-to-b from-emerald-600 to-emerald-700 px-5 text-sm font-semibold text-white shadow transition hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
          >
            <BoltIcon className="w-4 h-4" />
            {processing && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
            )}
            {processing ? "Архивлаж байна..." : "Архивлах"}
          </button>
        )}
        {formData.form_status_id === 7 && (
          <button
            type="button"
            onClick={() => handleStatus(5)}
            disabled={processing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-b-error-500 bg-linear-to-b from-error-600 to-error-700 px-5 text-sm font-semibold text-white shadow transition hover:from-error-700 hover:to-error-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
          >
            <ErrorIcon className="w-4 h-4" />
            {processing && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
            )}
            {processing ? "Буцааж байна..." : "Буцаах"}
          </button>
        )}
        <button
          type="button"
          //onClick={() => helpOpen()}
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
      {confirmOpen && (
        <div
          className="fixed w-full inset-0 z-1000 flex items-center justify-center bg-black/40"
          onMouseDown={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg max-h-10/12 overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="text-center">
                <h2 className="text-lg font-semibold">Баталгаажуулалт</h2>
              </div>
              <button
                className="rounded px-2 py-1 hover:bg-gray-100"
                onClick={() => setConfirmOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="text-lg font-semibold">
                  Уг үйлдлийг хийхдээ итгэлтэй байна уу?
                </span>
              </div>
              <div className="flex items-center justify-center gap-8">
                <button
                  type="button"
                  onClick={() => handleProcess()}
                  className="bg-blue-600 text-white px-5 h-10 rounded-lg transition hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Тийм
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="bg-red-600 text-white px-5 h-10 rounded-lg transition hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Үгүй
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
