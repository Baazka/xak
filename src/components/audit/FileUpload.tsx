"use client";

import React, { useRef } from "react";

export type UploadedFileItem = {
  file: File;
  preview?: string;
};

type Props = {
  label?: string;
  accept?: string;
  multiple?: boolean;
  value: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  maxSizeMB?: number;
};

export default function FileUpload({
  label = "",
  accept = "*",
  multiple = true,
  value,
  onChange,
  maxSizeMB = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const mapped: UploadedFileItem[] = validFiles.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));

    onChange(multiple ? [...value, ...mapped] : mapped.slice(0, 1));

    e.target.value = "";
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
      <label className="block text-sm font-medium">{label}</label>

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
        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
      >
        Файл сонгох
      </button>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item, index) => {
            const actualFile = item instanceof File ? item : item?.file;
            const preview = item instanceof File ? undefined : item?.preview;

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
                    <p className="truncate text-sm font-medium">{actualFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(actualFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
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
