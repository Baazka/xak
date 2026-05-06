"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import React, { useEffect, useRef, useState } from "react";

export type UploadedFileItem = {
  file?: File;
  preview?: string;
  file_id?: number | null;
  original_name?: string;
  stored_name?: string;
  file_path?: string;
  size?: number;
};

type Props = {
  label?: string;
  accept?: string;
  multiple?: boolean;
  value?: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  onUploaded?: (fileIds: number[], uploadedFiles: UploadedFileItem[]) => void;
  onRemove?: (removedFile: UploadedFileItem) => void;
  maxSizeMB?: number;
  auditId: number;
  uploadUrl?: string;
};

export default function FileUpload({
  label = "",
  accept = "*",
  multiple = true,
  value = [],
  onChange,
  onUploaded,
  onRemove,
  maxSizeMB = 10,
  auditId,
  uploadUrl = "/api/files/upload",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const files = value ?? [];

  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (!selected.length) return;

    const maxBytes = maxSizeMB * 1024 * 1024;

    const validFiles = selected.filter((file) => {
      if (file.size > maxBytes) {
        alert(`${file.name} файл ${maxSizeMB}MB-аас их байна`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) return;

    if (!auditId) {
      alert("auditId байхгүй байна");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("audit_id", String(auditId));

      validFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetchWithAuth(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.error || "Файл хадгалах үед алдаа гарлаа");
      }

      const savedFiles = Array.isArray(result?.files) ? result.files : [];

      const mapped: UploadedFileItem[] = validFiles.map((file, index) => {
        const saved = savedFiles[index];

        return {
          file,
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          file_id: saved?.file_id ?? null,
          original_name: saved?.original_name ?? file.name,
          stored_name: saved?.stored_name,
          file_path: saved?.file_path,
          size: saved?.size ?? file.size,
        };
      });

      const nextValue = multiple ? [...files, ...mapped] : mapped.slice(0, 1);

      if (!multiple) {
        files.forEach((item) => {
          if (item.preview) URL.revokeObjectURL(item.preview);
        });
      }

      onChange(nextValue);

      onUploaded?.(
        mapped
          .map((item) => item.file_id)
          .filter((id): id is number => typeof id === "number" && id > 0),
        mapped
      );
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Файл хадгалах үед алдаа гарлаа");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const target = files[index];
    if (!target) return;

    if (target.preview) {
      URL.revokeObjectURL(target.preview);
    }

    onChange(files.filter((_, i) => i !== index));
    onRemove?.(target);
  };

  return (
    <div className="space-y-3">
      {label ? (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFiles}
        className="hidden"
      />

      <button
        type="button"
        onClick={handlePick}
        disabled={uploading}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        {uploading ? "Файл хуулж байна..." : "Файл сонгох"}
      </button>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item, index) => {
            const actualFile = item.file;

            const fileName = item.original_name || actualFile?.name || "Хадгалсан файл";

            const fileSize = actualFile?.size ?? item.size;

            return (
              <div
                key={`${item.file_id ?? fileName}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt={fileName}
                      className="h-11 w-11 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      FILE
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                      {fileName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {fileSize ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : "Хадгалсан файл"}
                    </p>

                    {item.file_id ? (
                      <p className="text-xs text-green-600">ID: {item.file_id}</p>
                    ) : (
                      <p className="text-xs text-amber-600">ID үүсээгүй</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="shrink-0 rounded-md px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Устгах
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
