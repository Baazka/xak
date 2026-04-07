"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  auditId: number;
};

type TableRow = {
  noti_id: number;
  noti_form_id: number;
  ind_id: number;
  ind_group_label: string;
  ind_label: string;
  noti_value: boolean | null;
};

type MeetingType = {
  role_id: number;
  role_label: string;
  role_code: string;
  role_text: string;
};

type MeetingRow = {
  meet_id: number;
  role_id: number;
  role_label: string;
  meeting_date: string;
  note: string;
};

export default function Form106({ auditId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [meetingRows, setMeetingRows] = useState<MeetingRow[]>([]);
  const [meetingList, setMeetingList] = useState<MeetingType[]>([]);
  const [formId, setFormId] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogSaving, setDialogSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogRoleId, setDialogRoleId] = useState<number | "">("");
  const [dialogDate, setDialogDate] = useState("");
  const [dialogNote, setDialogNote] = useState("");

  const groupedData = useMemo(() => {
    return data.reduce<Record<string, TableRow[]>>((acc, row) => {
      const key = row.ind_group_label || "Бусад";
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});
  }, [data]);

  const resetDialog = () => {
    setDialogRoleId("");
    setDialogDate("");
    setDialogNote("");
  };

  const loadTableData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetchWithAuth(`/api/audit/form106?aud_id=${auditId}`);
      const result = await res.json();

      setData(result.data || []);
      setFormId(result.form_id || 0);
      setMeetingRows(result.meeting_data || []);
      setMeetingList(result.meeting_list || []);
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

  const onChange = (id: number, value: boolean) => {
    setData((prev) => prev.map((row) => (row.ind_id === id ? { ...row, noti_value: value } : row)));
  };


  const handleDialogSave = async () => {
    try {
      if (!dialogRoleId || !dialogDate) {
        alert("Албан тушаал болон огноо оруулна уу");
        return;
      }

      setDialogSaving(true);

      const res = await fetchWithAuth(`/api/audit/form106`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          role_id: dialogRoleId,
          meeting_date: dialogDate,
          note: dialogNote,
        }),
      });

      if (!res.ok) {
        throw new Error("Мөр хадгалахад алдаа гарлаа");
      }

      resetDialog();
      setOpenDialog(false);
      await loadTableData();

      alert("Мөр амжилттай хадгалагдлаа");
    } catch (error) {
      console.error(error);
      alert("Мөр хадгалахад алдаа гарлаа");
    } finally {
      setDialogSaving(false);
    }
  };

  const handleDeleteMeeting = async (meetId: number) => {
    try {
      const res = await fetchWithAuth(`/api/audit/form106/meeting/${meetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Устгахад алдаа гарлаа");
      }

      await loadTableData();
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
            onClick={() => setOpenDialog(true)}
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
                <th className="border px-3 py-2 text-left">Албан тушаал</th>
                <th className="border px-3 py-2 text-left">Огноо</th>
                <th className="border px-3 py-2 text-left">Тайлбар</th>
                <th className="border px-3 py-2 text-center w-24">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {meetingRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border px-3 py-6 text-center text-gray-500">
                    Мэдээлэл байхгүй байна
                  </td>
                </tr>
              ) : (
                meetingRows.map((row, index) => (
                  <tr key={row.meet_id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">{index + 1}</td>
                    <td className="border px-3 py-2">{row.role_label}</td>
                    <td className="border px-3 py-2">{row.meeting_date}</td>
                    <td className="border px-3 py-2">{row.note}</td>
                    <td className="border px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteMeeting(row.meet_id)}
                        className="rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                      >
                        Устгах
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-base font-semibold">Мөр нэмэх</h3>
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
                <label className="mb-1 block text-sm font-medium">Албан тушаал</label>
                <select
                  value={dialogRoleId}
                  onChange={(e) => setDialogRoleId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="">Сонгох</option>
                  {meetingList.map((item) => (
                    <option key={item.role_id} value={item.role_id}>
                      {item.role_label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Огноо</label>
                <input
                  type="date"
                  value={dialogDate}
                  onChange={(e) => setDialogDate(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Тайлбар</label>
                <textarea
                  value={dialogNote}
                  onChange={(e) => setDialogNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Тайлбар..."
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
