"use client";

import FileUpload, { UploadedFileItem } from "@/components/ui/FileUpload";
import DatePicker from "@/components/form/date-picker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useCallback, useEffect, useState } from "react";
import { Edit } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import TimePicker from "@/components/form/TimePicker";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/tables/SkeletonTable";
import { useAuth } from "@/context/AuthContext";

type TableRow = {
  contract_id: number;
  contract_name: string;
  contract_begin_date: Date;
  contract_end_date: Date;
  contract_file_id: number | null;
  status: string;
};

export default function XakorgContractListPage() {
  const { user } = useAuth();
  const [data, setData] = useState<TableRow[]>([]);
  const [draftRow, setDraftRow] = useState<Partial<TableRow> | null>(null);
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [originalFileId, setOriginalFileId] = useState<number | null>(null);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dialogSaving, setDialogSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const resetDialog = () => {
    setDraftRow(null);
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
        body: JSON.stringify({}),
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

  const handleSave = async () => {
    toast("success", "Амжилттай хадгаллаа");
  };

  const handleEdit = (row: TableRow) => {
    setDraftRow({
      // meeting_id: row.meeting_id,
      // meeting_aud_id: row.meeting_aud_id,
      // meeting_form_id: row.meeting_form_id,
      // meeting_type_id: row.meeting_type_id,
      // meeting_type_name: row.meeting_type_name,
      // meeting_date: row.meeting_date ?? "",
      // meeting_time: row.meeting_time ?? "",
      // meeting_place: row.meeting_place ?? "",
      // meeting_scope: row.meeting_scope ?? "",
      // meeting_file_id: row.meeting_file_id ?? null,
    });

    setOriginalFileId(row.contract_id ?? null);

    if (row.contract_id) {
      const fakeFile = new File([""], `Хавсралт-${row.contract_id}`);

      setFiles([
        {
          file: fakeFile,
          file_id: row.contract_id,
          original_name: `Хавсралт-${row.contract_id}`,
        },
      ]);
    } else {
      setFiles([]);
    }

    setOpenDialog(true);
  };

  const handleDelete = async (meetId: number) => {
    const targetRow = data.find((row) => row.contract_id === meetId);
    const fileId = targetRow?.contract_file_id ?? null;

    try {
      const res = await fetchWithAuth(`/api/audit/form106`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_id: meetId }),
      });

      if (!res.ok) {
        throw new Error("Мөр устгахад алдаа гарлаа");
      }

      let fileDeleteFailed = false;

      if (fileId) {
        try {
          await fetchWithAuth(`/api/files/delete/${fileId}`, {
            method: "DELETE",
          });
        } catch (fileError) {
          fileDeleteFailed = true;
          console.error("Холбоотой файл устгахад алдаа гарлаа", fileError);
        }
      }

      await loadTableData();

      if (fileDeleteFailed) {
        toast("error", "Мөр устсан, гэхдээ хавсаргасан файл устгаж чадсангүй");
      }
    } catch (error) {
      console.error(error);
      toast("error", "Мөр устгахад алдаа гарлаа");
    }
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
                  Хурлын төрөл
                </th>
                <th className="w-30 border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Огноо
                </th>
                <th className="w-30 border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Цаг
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Байршил
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Цар хүрээ
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
                        <DeleteConfirmDialog onConfirm={() => handleDelete(row.contract_id)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {JSON.stringify(user)}
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
                      Уулзалтын төрөл
                    </label>
                    <select
                      value={draftRow?.contract_id ?? ""}
                      onChange={(e) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          meeting_type_id: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="">Сонгох</option>
                      {meetingTypeList.map((item) => (
                        <option key={item.type_id} value={item.type_id}>
                          {item.type_label}
                        </option>
                      ))}
                    </select>
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
                    <TimePicker
                      id="contract_end_date"
                      value={draftRow?.contract_end_date ?? ""}
                      onChange={(val) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          contract_end_date: val,
                        }))
                      }
                      size="md"
                      minuteStep={5}
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
                      value={Files}
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
