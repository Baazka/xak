"use client";

import * as React from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { XakorgContractRow } from "../types";
import { FormErrors, ValidationSchema, validateForm } from "@/utils/validation";
import { useToast } from "@/context/ToastContext";
import DatePicker from "@/components/form/date-picker";
import FileUpload, { UploadedFileItem } from "@/components/ui/FileUpload";
import { useState } from "react";

export type ContractFormValue = Pick<
  XakorgContractRow,
  "contract_id" | "contract_name" | "contract_begin_date" | "contract_end_date" | "contract_file_id"
>;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  mode: "create" | "edit" | "confirm";
  initialData?: ContractFormValue | null;

  onSaved?: () => void;
};

type ContractFormData = {
  contract_id: number;
  contract_name: string;
  contract_begin_date: string;
  contract_end_date: string | null;
  contract_file_id: number | null;
};

const contractSchema: ValidationSchema<ContractFormData> = {
  contract_name: { required: true, label: "Гэрээний нэр" },
  contract_file_id: { required: true, label: "Гэрээний файл" },
};

export default function ContractDialog({ open, onOpenChange, mode, initialData, onSaved }: Props) {
  const isEdit = mode === "edit";
  const isConfirm = mode === "confirm";
  const { toast } = useToast();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [originalFileId, setOriginalFileId] = useState<number | null>(null);
  const [form, setForm] = React.useState<ContractFormData>({
    contract_id: 0,
    contract_name: "",
    contract_begin_date: "",
    contract_end_date: "",
    contract_file_id: null,
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<FormErrors<ContractFormData>>({});

  const inputClass = "w-full rounded border px-3 py-2";
  const normalClass = "border-gray-300";
  const errorClass = "border-red-500";

  const getInputClass = (field: keyof ContractFormData) =>
    `${inputClass} ${errors[field] ? errorClass : normalClass}`;

  const clearError = (field: keyof ContractFormData) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const renderError = (field: keyof ContractFormData) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  React.useEffect(() => {
    if (!open) return;

    setErrors({});
    setError(null);
    setLoading(false);
    setFiles([]);
    setOriginalFileId(null);

    setForm({
      contract_name: initialData?.contract_name ?? "",
      contract_begin_date: initialData?.contract_begin_date
        ? String(initialData.contract_begin_date).slice(0, 10)
        : "",
      contract_end_date: initialData?.contract_end_date
        ? String(initialData.contract_end_date).slice(0, 10)
        : "",
      contract_file_id: initialData?.contract_file_id ?? null,
      contract_id: initialData?.contract_id ?? 0,
    });
    setOriginalFileId(initialData?.contract_file_id ?? null);

    if (initialData?.contract_file_id) {
      const fakeFile = new File([""], `Хавсралт-${initialData.contract_file_id}`);

      setFiles([
        {
          file: fakeFile,
          file_id: initialData.contract_file_id,
          original_name: `Хавсралт-${initialData.contract_file_id}`,
        },
      ]);
    } else {
      setFiles([]);
    }
  }, [open, initialData]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const previousFileId = originalFileId ?? null;
    const nextFileId =
      initialData?.contract_id && Number(initialData.contract_id) > 0
        ? Number(initialData.contract_file_id)
        : null;
    setError(null);

    const formData: ContractFormData = {
      contract_name: form.contract_name,
      contract_begin_date: form.contract_begin_date,
      contract_end_date: form.contract_end_date,
      contract_file_id: form.contract_file_id,
      contract_id: form.contract_id,
    };

    const validationErrors = validateForm(formData, contractSchema);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      let res: Response;
      const body = {
        contract_name: form.contract_name,
        contract_begin_date: form.contract_begin_date,
        contract_end_date: form.contract_end_date,
        contract_file_id: form.contract_file_id,
        status: isConfirm ? "CONFIRMED" : isEdit ? "PENDING" : "CONFIRMED",
      };

      if (isEdit || isConfirm) {
        res = await fetchWithAuth(`/api/xakorg_contract/${initialData?.contract_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetchWithAuth("/api/xakorg_contract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || "Хадгалахад алдаа гарлаа");
        return;
      }

      onOpenChange(false);
      onSaved?.();

      toast(
        "success",
        isConfirm ? "Амжилттай батлагдлаа" : isEdit ? "Амжилттай засагдлаа" : "Амжилттай нэмэгдлээ"
      );
    } catch (err: any) {
      setError(err?.message || "Сүлжээний алдаа");

      if (nextFileId && (!previousFileId || previousFileId !== nextFileId)) {
        try {
          await fetchWithAuth(`/api/files/delete/${nextFileId}`, {
            method: "DELETE",
          });
        } catch (err) {
          console.error("Шинэ upload хийсэн файлыг rollback delete хийж чадсангүй", err);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {isConfirm ? "Гэрээ батлах" : isEdit ? "Мэдээлэл засах" : "Шинэ гэрээ"}

          <button
            className="rounded px-2 py-1 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-4 px-4 py-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Гэрээний нэр
              </label>
              <input
                type="text"
                id="contract_name"
                value={form.contract_name}
                readOnly={isConfirm}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    contract_name: e.target.value,
                  }))
                }
                className={getInputClass("contract_name")}
              />
              {renderError("contract_name")}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Эхлэх хугацаа
              </label>
              <DatePicker
                id="contract_begin_date"
                defaultDate={form?.contract_begin_date ?? ""}
                disabled={isConfirm}
                onChange={(value: Date[]) =>
                  setForm((prev) => ({
                    ...prev,
                    contract_begin_date: value?.[0]?.toISOString().slice(0, 10) ?? "",
                  }))
                }
              />
            </div>
            {isConfirm && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Дуусах хугацаа
                </label>

                <DatePicker
                  id="contract_end_date"
                  defaultDate={form?.contract_end_date ?? ""}
                  disabled={isEdit}
                  onChange={(value: Date[]) =>
                    setForm((prev) => ({
                      ...prev,
                      contract_end_date: value?.[0]?.toISOString().slice(0, 10) ?? "",
                    }))
                  }
                />
              </div>
            )}
            {isEdit && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Хавсралт
                </label>
                <FileUpload
                  key={`${form?.contract_id ?? 0}-${form?.contract_id ?? 0}`}
                  accept=".pdf,.doc,.docx"
                  multiple={false}
                  auditId={8888888}
                  value={files}
                  onChange={(files) => {
                    setFiles(files);

                    if (!files.length) {
                      setForm((prev) => ({
                        ...prev,
                        contract_file_id: null,
                      }));
                    }
                  }}
                  onUploaded={(fileIds) =>
                    setForm((prev) => ({
                      ...prev,
                      contract_file_id: fileIds[0] ?? null,
                    }))
                  }
                  onRemove={async () => {
                    setFiles([]);

                    setForm((prev) => ({
                      ...prev,
                      contract_file_id: null,
                    }));
                  }}
                />
                {renderError("contract_file_id")}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded border px-4 py-2"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Болих
            </button>
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
