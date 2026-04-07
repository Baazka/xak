"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import React, { useRef, useState } from "react";

export type UploadedFileItem = {
  file: File;
  preview?: string;
  file_id?: number | null;
  original_name?: string;
  stored_name?: string;
  file_path?: string;
};

type Props = {
  label?: string;
  accept?: string;
  multiple?: boolean;
  value: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  onUploaded?: (fileIds: number[], uploadedFiles: UploadedFileItem[]) => void;
  maxSizeMB?: number;
  auditId: number;
  uploadUrl?: string;
};

export default function FileUpload({
  label = "",
  accept = "*",
  multiple = true,
  value,
  onChange,
  onUploaded,
  maxSizeMB = 10,
  auditId,
  uploadUrl = "/api/files/upload",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    const maxBytes = maxSizeMB * 1024 * 1024;

    const validFiles = selected.filter((file) => {
      if (file.size > maxBytes) {
        alert(`${file.name} файл ${maxSizeMB}MB-аас их байна`);
        return false;
      }
      return true;
    });

    if (!validFiles.length) {
      e.target.value = "";
      return;
    }

    if (!auditId) {
      alert("auditId байхгүй байна");
      e.target.value = "";
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
        };
      });

      const nextValue = multiple ? [...value, ...mapped] : mapped.slice(0, 1);

      onChange(nextValue);

      if (onUploaded) {
        onUploaded(
          mapped.map((item) => item.file_id).filter((id): id is number => Number(id) > 0),
          mapped
        );
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Файл хадгалах үед алдаа гарлаа");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    const target = value[index];

    if (target?.preview) {
      URL.revokeObjectURL(target.preview);
    }

    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {label ? <label className="block text-sm font-medium">{label}</label> : null}

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
        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? "Файл хуулж байна..." : "Файл сонгох"}
      </button>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item, index) => {
            const actualFile = item?.file;
            const preview = item?.preview;

            if (!actualFile) return null;

            return (
              <div
                key={`${actualFile.name}-${index}`}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {preview ? (
                    <img
                      src={preview}
                      alt={actualFile.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-xs">
                      FILE
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.original_name || actualFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(actualFile.size / 1024 / 1024).toFixed(2)} MB
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
                  className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50"
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
