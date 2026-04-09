"use client";

import FileUpload, { UploadedFileItem } from "@/components/ui/FileUpload";
import DatePicker from "@/components/form/date-picker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  auditId: number;
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

export default function Form106({ auditId }: Props) {
  const [meetingTypeList, setMeetingTypeList] = useState<MeetingType[]>([]);
  const [meetingList, setMeetingList] = useState<MeetingRow[]>([]);
  const [draftRow, setDraftRow] = useState<Partial<MeetingRow> | null>(null);
  const [formId, setFormId] = useState(0);
  const [meetingFiles, setMeetingFiles] = useState<UploadedFileItem[]>([]);
  const [originalMeetingFileId, setOriginalMeetingFileId] = useState<number | null>(null);

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
      alert("Мэдээлэл дуудах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  useEffect(() => {
    loadTableData();
  }, [loadTableData]);

  const handleDialogSave = async () => {
    if (!draftRow?.meeting_type_id || !draftRow?.meeting_date) {
      alert("Төрөл болон огноо оруулна уу");
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

      alert(error instanceof Error ? error.message : "Мэдээлэл хадгалах үед алдаа гарлаа");
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
        alert("Мөр устсан, гэхдээ хавсаргасан файл устгаж чадсангүй");
      }
    } catch (error) {
      console.error(error);
      alert("Мөр устгахад алдаа гарлаа");
    }
  };

  if (loading) {
    return <div>Уншиж байна...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Meeting table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
          <div className="text-sm font-semibold">Уулзалтын мэдээлэл</div>

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
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-center w-10">№</th>
                <th className="border px-3 py-2 text-left">Хурлын төрөл</th>
                <th className="border px-3 py-2 text-left">Огноо</th>
                <th className="border px-3 py-2 text-left">Цаг</th>
                <th className="border px-3 py-2 text-left">Байршил</th>
                <th className="border px-3 py-2 text-left">Цар хүрээ</th>
                <th className="border px-3 py-2 text-left">Хавсралт</th>
                <th className="border px-3 py-2 text-center w-24">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {meetingList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border px-3 py-6 text-center text-gray-500">
                    Мэдээлэл байхгүй байна
                  </td>
                </tr>
              ) : (
                meetingList.map((row, index) => (
                  <tr key={row.meeting_id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">{index + 1}</td>
                    <td className="border px-3 py-2">{row.meeting_type_name}</td>
                    <td className="border px-3 py-2">{row.meeting_date}</td>
                    <td className="border px-3 py-2">{row.meeting_time}</td>
                    <td className="border px-3 py-2">{row.meeting_place}</td>
                    <td className="border px-3 py-2">{row.meeting_scope}</td>
                    <td className="border px-3 py-2">
                      {row.meeting_file_id ? (
                        <a
                          href={`/api/files/download/${row.meeting_file_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Хавсрал үзэх
                        </a>
                      ) : null}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditMeeting(row)}
                          className="rounded-md bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
                        >
                          Засах
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMeeting(row.meeting_id)}
                          className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                        >
                          Устгах
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-base font-semibold">
                {draftRow?.meeting_id ? "Уулзалтын мэдээлэл засах" : "Уулзалтын бүртгэл"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  resetDialog();
                  setOpenDialog(false);
                }}
                className="text-lg text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 px-4 py-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Уулзалтын төрөл</label>
                <select
                  value={draftRow?.meeting_type_id ?? ""}
                  onChange={(e) =>
                    setDraftRow((prev) => ({
                      ...prev!,
                      meeting_type_id: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
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
                <label className="mb-1 block text-sm font-medium">Огноо</label>
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
                <label className="mb-1 block text-sm font-medium">Цаг</label>
                <DatePicker
                  id="meeting_time"
                  mode="time"
                  defaultDate={draftRow?.meeting_time ?? ""}
                  onChange={(selectedDates, dateStr) =>
                    setDraftRow((prev) => ({
                      ...prev!,
                      meeting_time: dateStr ?? "",
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Байршил</label>
                <textarea
                  value={draftRow?.meeting_place ?? ""}
                  onChange={(e) =>
                    setDraftRow((prev) => ({
                      ...prev!,
                      meeting_place: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Цар хүрээ</label>
                <textarea
                  value={draftRow?.meeting_scope ?? ""}
                  onChange={(e) =>
                    setDraftRow((prev) => ({
                      ...prev!,
                      meeting_scope: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Хавсралт</label>
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

            <div className="flex justify-end gap-2 border-t px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  resetDialog();
                  setOpenDialog(false);
                }}
                className="rounded-lg border px-4 py-2"
              >
                Болих
              </button>

              <button
                type="button"
                onClick={handleDialogSave}
                disabled={dialogSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {dialogSaving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
