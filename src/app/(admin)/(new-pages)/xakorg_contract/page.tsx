"use client";

import FileUpload, { UploadedFileItem } from "@/components/ui/FileUpload";
import DatePicker from "@/components/form/date-picker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useCallback, useEffect, useState } from "react";
import { Edit } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/tables/SkeletonTable";
import { FormErrors } from "@/utils/validation";
import { useAuth } from "@/context/AuthContext";
import { XakorgContractRow } from "./types";
import { DataTable } from "@/components/tables/DataTable";
import { columns } from "./columns";

export default function XakorgContractListPage() {
  const { user } = useAuth();
  const [data, setData] = useState<XakorgContractRow[]>([]);
  const [draftRow, setDraftRow] = useState<Partial<XakorgContractRow> | null>(null);
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [originalFileId, setOriginalFileId] = useState<number | null>(null);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dialogSaving, setDialogSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const [errors, setErrors] = useState<FormErrors<XakorgContractRow>>({});

  const inputClass =
    "w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-1 dark:bg-gray-900 dark:text-white";

  const normalClass =
    "border-gray-300 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700";

  const errorClass = "border-red-500 focus:border-red-500 focus:ring-red-500";

  const getInputClass = (field: keyof XakorgContractRow) =>
    `${inputClass} ${errors[field] ? errorClass : normalClass}`;

  const resetDialog = () => {
    setDraftRow(null);
    setFiles([]);
    setOriginalFileId(null);
    setErrors({});
  };

  const loadTableData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetchWithAuth(`/api/xakorg_contract`);
      const result = await res.json();

      setData(result.data || []);
    } catch (err) {
      console.error(err);
      toast("error", "Мэдээлэл дуудах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleDialogSave = async () => {
    const isEditMode = Boolean(draftRow?.contract_id && draftRow.contract_id > 0);
    const previousFileId = originalFileId ?? null;
    const nextFileId =
      draftRow?.contract_id && Number(draftRow.contract_id) > 0
        ? Number(draftRow.contract_file_id)
        : null;

    try {
      setDialogSaving(true);

      const res = await fetchWithAuth(`/api/xakorg_contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: draftRow?.contract_id,
          contract_name: draftRow?.contract_name,
          contract_begin_date: draftRow?.contract_begin_date,
          contract_end_date: draftRow?.contract_end_date,
          contract_file_id: draftRow?.contract_file_id,
          status: "PENDING",
          xakorg_id: user?.org_id,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.error || "Мэдээлэл хадгалах үед алдаа гарлаа");
      }

      if (isEditMode && previousFileId && previousFileId !== nextFileId) {
        await fetchWithAuth(`/api/files/delete/${previousFileId}`, {
          method: "DELETE",
        });
      }

      resetDialog();
      setOpenDialog(false);
      await loadTableData();
    } catch (error) {
      console.error(error);

      if (nextFileId && (!previousFileId || previousFileId !== nextFileId)) {
        try {
          await fetchWithAuth(`/api/files/delete/${nextFileId}`, {
            method: "DELETE",
          });
        } catch (err) {
          console.error("Шинэ upload хийсэн файлыг rollback delete хийж чадсангүй", err);
        }
      }

      toast("error", error instanceof Error ? error.message : "Мэдээлэл хадгалах үед алдаа гарлаа");
    } finally {
      setDialogSaving(false);
    }
  };

  const handleEdit = (row: XakorgContractRow) => {
    setDraftRow({
      contract_id: row.contract_id,
      contract_name: row.contract_name,
      contract_begin_date: row.contract_begin_date,
      contract_end_date: row.contract_end_date,
      contract_file_id: row.contract_file_id,
      status: row.status,
    });

    setOriginalFileId(row.contract_file_id ?? null);

    if (row.contract_file_id) {
      const fakeFile = new File([""], `Хавсралт-${row.contract_file_id}`);

      setFiles([
        {
          file: fakeFile,
          file_id: row.contract_file_id,
          original_name: `Хавсралт-${row.contract_file_id}`,
        },
      ]);
    } else {
      setFiles([]);
    }

    setOpenDialog(true);
  };

  return (
    <>
      {loading ? (
        <SkeletonTable />
      ) : (
        <>
          <div className="flex items-center justify-end gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                resetDialog();
                setDraftRow({
                  contract_id: 0,
                });
                setOriginalFileId(null);
                setOpenDialog(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Нэмэх
            </button>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800/80">
                <th className="w-10 border border-gray-200 px-3 py-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  №
                </th>
                <th className="w-60 border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Гэрээний нэр
                </th>
                <th className="w-30 border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Эхлэх хугацаа
                </th>
                <th className="w-30 border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дуусах хугацаа
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Төлөв
                </th>
                <th className="w-30 border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100 no-print">
                  Хавсралт
                </th>
                <th className="w-10 border border-gray-200 px-3 py-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100 no-print">
                  Үйлдэл
                </th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="border border-gray-200 px-3 py-6 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400"
                  >
                    Мэдээлэл байхгүй байна
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={row.contract_id}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60"
                  >
                    <td className="border border-gray-200 px-3 py-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.contract_name}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.contract_begin_date}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.contract_end_date}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.status}
                    </td>

                    <td className="border border-gray-200 px-3 py-2 dark:border-gray-700 no-print">
                      {row.contract_file_id ? (
                        <a
                          href={`/api/files/download/${row.contract_file_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Хавсралт үзэх
                        </a>
                      ) : null}
                    </td>
                    <td className="w-10 border border-gray-200 px-3 py-2 text-center dark:border-gray-700 no-print">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href="#"
                          onClick={() => handleEdit(row)}
                          className="flex w-full cursor-pointer justify-center text-yellow-500 dark:text-yellow-400"
                        >
                          <Edit className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {openDialog && (
            <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-900">
                <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-800">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {draftRow?.contract_id
                      ? "Байгууллагын гэрээ засах"
                      : "Байгууллагын гэрээ бүртгэл"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      resetDialog();
                      setOpenDialog(false);
                    }}
                    className="text-lg text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 px-4 py-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Гэрээнийн нэр
                    </label>
                    <input
                      type="text"
                      id="contract_name"
                      value={draftRow?.contract_name ?? ""}
                      onChange={(e) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          contract_name: e.target.value,
                        }))
                      }
                      className={getInputClass("contract_name")}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Эхлэх хугацаа
                    </label>
                    <DatePicker
                      id="contract_begin_date"
                      defaultDate={draftRow?.contract_begin_date ?? ""}
                      onChange={(value: Date[]) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          contract_begin_date: value?.[0]?.toISOString().slice(0, 10) ?? "",
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Дуусах хугацаа
                    </label>
                    <DatePicker
                      id="contract_end_date"
                      defaultDate={draftRow?.contract_end_date ?? ""}
                      onChange={(value: Date[]) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          contract_end_date: value?.[0]?.toISOString().slice(0, 10) ?? "",
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Хавсралт
                    </label>
                    <FileUpload
                      key={`${draftRow?.contract_id ?? 0}-${draftRow?.contract_id ?? 0}`}
                      accept=".pdf,.doc,.docx"
                      multiple={false}
                      auditId={8888888}
                      value={files}
                      onChange={(files) => {
                        setFiles(files);

                        if (!files.length) {
                          setDraftRow((prev) => ({
                            ...prev!,
                            contract_file_id: null,
                          }));
                        }
                      }}
                      onUploaded={(fileIds) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          contract_file_id: fileIds[0] ?? null,
                        }))
                      }
                      onRemove={async () => {
                        setFiles([]);

                        setDraftRow((prev) => ({
                          ...prev!,
                          contract_file_id: null,
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t px-4 py-3 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      resetDialog();
                      setOpenDialog(false);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    Болих
                  </button>

                  <button
                    type="button"
                    onClick={handleDialogSave}
                    disabled={dialogSaving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-700"
                  >
                    {dialogSaving ? "Хадгалж байна..." : "Хадгалах"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
