"use client";

import FileUpload, { UploadedFileItem } from "@/components/ui/FileUpload";
import DatePicker from "@/components/form/date-picker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { Delete, DeleteIcon, Edit, MessageCircle, Printer } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import TimePicker from "@/components/form/TimePicker";
import { usePrint } from "@/hooks/usePrint";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { useToast } from "@/context/ToastContext";

type Props = {
  auditId: number;
  formListId: number;
};

type MeetingType = {
  type_id: number;
  type_label: string;
};

type MeetingRow = {
  meeting_id: number;
  meeting_aud_id: number;
  meeting_form_id: number;
  meeting_type_id: number;
  meeting_type_name: string;
  meeting_date: string;
  meeting_time: string;
  meeting_place: string;
  meeting_scope: string;
  meeting_file_id: number | null;
};

export default function Form106({ auditId, formListId }: Props) {
  const [meetingTypeList, setMeetingTypeList] = useState<MeetingType[]>([]);
  const [meetingList, setMeetingList] = useState<MeetingRow[]>([]);
  const [draftRow, setDraftRow] = useState<Partial<MeetingRow> | null>(null);
  const [formId, setFormId] = useState(0);
  const [meetingFiles, setMeetingFiles] = useState<UploadedFileItem[]>([]);
  const [originalMeetingFileId, setOriginalMeetingFileId] = useState<number | null>(null);
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dialogSaving, setDialogSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const resetDialog = () => {
    setDraftRow(null);
    setMeetingFiles([]);
    setOriginalMeetingFileId(null);
  };

  const loadTableData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetchWithAuth(`/api/audit/form106?aud_id=${auditId}`);
      const result = await res.json();

      const resMeta = await fetchWithAuth(`/api/audit/form106/meta`);
      const resultMeta = await resMeta.json();

      setFormId(result.form_id || 0);
      setMeetingList(result.data || []);

      setMeetingTypeList(resultMeta.meeting_type || []);
    } catch (err) {
      console.error(err);
      toast("error", "Мэдээлэл дуудах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleDialogSave = async () => {
    if (!draftRow?.meeting_type_id || !draftRow?.meeting_date) {
      toast("info", "Төрөл болон огноо оруулна уу");
      return;
    }

    const isEditMode = Boolean(draftRow?.meeting_id && draftRow.meeting_id > 0);
    const previousFileId = originalMeetingFileId ?? null;
    const nextFileId =
      draftRow?.meeting_file_id && Number(draftRow.meeting_file_id) > 0
        ? Number(draftRow.meeting_file_id)
        : null;

    try {
      setDialogSaving(true);

      const res = await fetchWithAuth(`/api/audit/form106`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          meeting_id: draftRow?.meeting_id ?? null,
          meeting_type_id: draftRow?.meeting_type_id ?? null,
          meeting_date: draftRow?.meeting_date ?? null,
          meeting_time: draftRow?.meeting_time ?? "",
          meeting_place: draftRow?.meeting_place ?? "",
          meeting_scope: draftRow?.meeting_scope ?? "",
          meeting_file_id: nextFileId,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.error || "Мэдээлэл хадгалах үед алдаа гарлаа");
      }

      if (isEditMode && previousFileId && previousFileId !== nextFileId) {
        try {
          await fetchWithAuth(`/api/files/delete/${previousFileId}`, {
            method: "DELETE",
          });
        } catch (deleteErr) {
          console.error("Хуучин файл устгаж чадсангүй", deleteErr);
        }
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

  const handleEditMeeting = (row: MeetingRow) => {
    setDraftRow({
      meeting_id: row.meeting_id,
      meeting_aud_id: row.meeting_aud_id,
      meeting_form_id: row.meeting_form_id,
      meeting_type_id: row.meeting_type_id,
      meeting_type_name: row.meeting_type_name,
      meeting_date: row.meeting_date ?? "",
      meeting_time: row.meeting_time ?? "",
      meeting_place: row.meeting_place ?? "",
      meeting_scope: row.meeting_scope ?? "",
      meeting_file_id: row.meeting_file_id ?? null,
    });

    setOriginalMeetingFileId(row.meeting_file_id ?? null);

    if (row.meeting_file_id) {
      const fakeFile = new File([""], `Хавсралт-${row.meeting_file_id}`);

      setMeetingFiles([
        {
          file: fakeFile,
          file_id: row.meeting_file_id,
          original_name: `Хавсралт-${row.meeting_file_id}`,
        },
      ]);
    } else {
      setMeetingFiles([]);
    }

    setOpenDialog(true);
  };

  const handleDeleteMeeting = async (meetId: number) => {
    const targetRow = meetingList.find((row) => row.meeting_id === meetId);
    const fileId = targetRow?.meeting_file_id ?? null;

    try {
      const res = await fetchWithAuth(`/api/audit/form106`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meeting_id: meetId }),
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
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <>
          <div className="flex items-center justify-end gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                resetDialog();
                setDraftRow({
                  meeting_id: 0,
                  meeting_type_id: 0,
                  meeting_date: "",
                  meeting_time: "",
                  meeting_place: "",
                  meeting_scope: "",
                  meeting_file_id: null,
                });
                setOriginalMeetingFileId(null);
                setOpenDialog(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Нэмэх
            </button>
            <button
              type="button"
              onClick={() => openHelp({ audId: auditId, formId: formListId })}
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
              {meetingList.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="border border-gray-200 px-3 py-6 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400"
                  >
                    Мэдээлэл байхгүй байна
                  </td>
                </tr>
              ) : (
                meetingList.map((row, index) => (
                  <tr
                    key={row.meeting_id}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60"
                  >
                    <td className="border border-gray-200 px-3 py-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.meeting_type_name}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.meeting_date}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.meeting_time}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.meeting_place}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.meeting_scope}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 dark:border-gray-700 no-print">
                      {row.meeting_file_id ? (
                        <a
                          href={`/api/files/download/${row.meeting_file_id}`}
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
                          onClick={() => handleEditMeeting(row)}
                          className="flex w-full cursor-pointer justify-center text-yellow-500 dark:text-yellow-400"
                        >
                          <Edit className="h-4 w-4" />
                        </a>
                        <DeleteConfirmDialog
                          onConfirm={() => handleDeleteMeeting(row.meeting_id)}
                        />
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
                    {draftRow?.meeting_id ? "Уулзалтын мэдээлэл засах" : "Уулзалтын бүртгэл"}
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
                      value={draftRow?.meeting_type_id ?? ""}
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
                      Огноо
                    </label>
                    <DatePicker
                      id="meeting-date"
                      defaultDate={draftRow?.meeting_date ?? ""}
                      onChange={(value: Date[]) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          meeting_date: value?.[0]?.toISOString().slice(0, 10) ?? "",
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Цаг
                    </label>
                    <TimePicker
                      id="meeting_time"
                      value={draftRow?.meeting_time ?? ""}
                      onChange={(val) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          meeting_time: val,
                        }))
                      }
                      size="md"
                      minuteStep={5}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Байршил
                    </label>
                    <textarea
                      value={draftRow?.meeting_place ?? ""}
                      onChange={(e) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          meeting_place: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Цар хүрээ
                    </label>
                    <textarea
                      value={draftRow?.meeting_scope ?? ""}
                      onChange={(e) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          meeting_scope: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Хавсралт
                    </label>
                    <FileUpload
                      key={`${draftRow?.meeting_id ?? 0}-${draftRow?.meeting_file_id ?? 0}`}
                      accept=".pdf,.doc,.docx"
                      multiple={false}
                      auditId={auditId}
                      value={meetingFiles}
                      onChange={(files) => {
                        setMeetingFiles(files);

                        if (!files.length) {
                          setDraftRow((prev) => ({
                            ...prev!,
                            meeting_file_id: null,
                          }));
                        }
                      }}
                      onUploaded={(fileIds) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          meeting_file_id: fileIds[0] ?? null,
                        }))
                      }
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

          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
