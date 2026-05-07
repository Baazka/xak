"use client";

import FileUpload, { UploadedFileItem } from "@/components/ui/FileUpload";
import DatePicker from "@/components/form/date-picker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { Edit, MessageCircle, Printer } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { useToast } from "@/context/ToastContext";
import SkeletonCard from "../components/SkeletonCard";

type Props = {
  auditId: number;
  formListId: number;
};

type PlanType = {
  type_id: number;
  type_label: string;
};

type PlanRow = {
  plan_id: number;
  plan_form_id: number;
  plan_type_id: number;
  plan_type_name: string;
  plan_date: string;
  plan_comp_date: string;
  plan_description: string;
  plan_user_id: number;
  plan_file_id: number | null;
  user_firstname: string;
};

export default function Form209({ auditId, formListId }: Props) {
  const [planTypeList, setPlanTypeList] = useState<PlanType[]>([]);
  const [planList, setPlanList] = useState<PlanRow[]>([]);

  const [draftRow, setDraftRow] = useState<Partial<PlanRow> | null>(null);
  const [formId, setFormId] = useState(0);

  const [planFiles, setPlanFiles] = useState<UploadedFileItem[]>([]);
  const [originalPlanFileId, setOriginalPlanFileId] = useState<number | null>(null);
  const [meetingFiles, setMeetingFiles] = useState<UploadedFileItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [dialogSaving, setDialogSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const resetDialog = () => {
    setDraftRow(null);
    setMeetingFiles([]);
  };

  const loadTableData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetchWithAuth(`/api/audit/form209?aud_id=${auditId}`);
      const result = await res.json();

      const resMeta = await fetchWithAuth(`/api/audit/form209/meta`);
      const resultMeta = await resMeta.json();

      setFormId(result.form_id || 0);
      setPlanList(result.data || []);

      setPlanTypeList(resultMeta.plan_type || []);
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
    if (!draftRow?.plan_type_id || !draftRow?.plan_date) {
      toast("error", "Төрөл болон огноо оруулна уу");
      return;
    }

    const isEditMode = Boolean(draftRow?.plan_id && draftRow.plan_id > 0);
    const previousFileId = originalPlanFileId ?? null;
    const nextFileId =
      draftRow?.plan_file_id && Number(draftRow.plan_file_id) > 0
        ? Number(draftRow.plan_file_id)
        : null;

    try {
      setDialogSaving(true);

      const res = await fetchWithAuth(`/api/audit/form209`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          plan_id: draftRow?.plan_id ?? null,
          plan_type_id: draftRow?.plan_type_id ?? null,
          plan_date: draftRow?.plan_date ?? null,
          plan_comp_date: draftRow?.plan_comp_date ?? null,
          plan_description: draftRow?.plan_description ?? "",
          plan_file_id: nextFileId,
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

  const handleEditPlan = (row: PlanRow) => {
    setDraftRow({
      plan_id: row.plan_id,
      plan_form_id: row.plan_form_id,
      plan_type_id: row.plan_type_id,
      plan_type_name: row.plan_type_name,
      plan_date: row.plan_date ?? "",
      plan_comp_date: row.plan_comp_date ?? "",
      plan_description: row.plan_description ?? "",
      plan_file_id: row.plan_file_id ?? null,
    });

    setOriginalPlanFileId(row.plan_file_id ?? null);

    if (row.plan_file_id) {
      const fakeFile = new File([""], `Хавсралт-${row.plan_file_id}`);

      setMeetingFiles([
        {
          file: fakeFile,
          file_id: row.plan_file_id,
          original_name: `Хавсралт-${row.plan_file_id}`,
        },
      ]);
    } else {
      setPlanFiles([]);
    }

    setOpenDialog(true);
  };

  const handleDeletePlan = async (planId: number) => {
    const targetRow = planList.find((row) => row.plan_id === planId);
    const fileId = targetRow?.plan_file_id ?? null;

    try {
      const res = await fetchWithAuth(`/api/audit/form209`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
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

  const handleSave = async () => {
    toast("success", "Амжилттай хадгаллаа");
  };

  return (
    <>
      {loading ? (
        <SkeletonCard />
      ) : (
        <>
          <div className="flex items-center justify-end gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                resetDialog();
                setDraftRow({
                  plan_id: 0,
                  plan_type_id: 0,
                  plan_date: "",
                  plan_comp_date: "",
                  plan_description: "",
                  plan_user_id: 0,
                  plan_file_id: null,
                });
                setOriginalPlanFileId(null);
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
                  Төрөл
                </th>
                <th className="w-30 border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Бэлтгэсэн огноо
                </th>
                <th className="w-30 border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Хүргүүлсэн огноо
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тайлбар
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Боловсруулсан хэрэглэгч
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
              {planList.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="border border-gray-200 px-3 py-6 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400"
                  >
                    Мэдээлэл байхгүй байна
                  </td>
                </tr>
              ) : (
                planList.map((row, index) => (
                  <tr
                    key={row.plan_id}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60"
                  >
                    <td className="border border-gray-200 px-3 py-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.plan_type_name}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.plan_date}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.plan_comp_date}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.plan_description}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.user_firstname}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 dark:border-gray-700 no-print">
                      {row.plan_file_id ? (
                        <a
                          href={`/api/files/download/${row.plan_file_id}`}
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
                          onClick={() => handleEditPlan(row)}
                          className="flex w-full cursor-pointer justify-center text-yellow-500 dark:text-yellow-400"
                        >
                          <Edit className="h-4 w-4" />
                        </a>
                        <DeleteConfirmDialog onConfirm={() => handleDeletePlan(row.plan_id)} />
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
                    {draftRow?.plan_id
                      ? "Төлөвлөгөө, хөтөлбөр засах"
                      : "Төлөвлөгөө, хөтөлбөр бүртгэх"}
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
                      Төрөл
                    </label>
                    <select
                      value={draftRow?.plan_type_id ?? ""}
                      onChange={(e) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          plan_type_id: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="">Сонгох</option>
                      {planTypeList.map((item) => (
                        <option key={item.type_id} value={item.type_id}>
                          {item.type_label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Боловсруулсан огноо
                    </label>
                    <DatePicker
                      id="plan-date"
                      defaultDate={draftRow?.plan_date ?? ""}
                      onChange={(value: Date[]) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          plan_date: value?.[0]?.toISOString().slice(0, 10) ?? "",
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Хүргүүлсэн огноо
                    </label>
                    <DatePicker
                      id="plan-comp-date"
                      defaultDate={draftRow?.plan_comp_date ?? ""}
                      onChange={(value: Date[]) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          plan_comp_date: value?.[0]?.toISOString().slice(0, 10) ?? "",
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                      Тайлбар
                    </label>
                    <textarea
                      value={draftRow?.plan_description ?? ""}
                      onChange={(e) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          plan_description: e.target.value,
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
                      key={`${draftRow?.plan_id ?? 0}-${draftRow?.plan_file_id ?? 0}`}
                      accept=".pdf,.doc,.docx"
                      multiple={false}
                      auditId={auditId}
                      value={planFiles}
                      onChange={(files) => {
                        setPlanFiles(files);

                        if (!files.length) {
                          setDraftRow((prev) => ({
                            ...prev!,
                            plan_file_id: null,
                          }));
                        }
                      }}
                      onUploaded={(fileIds) =>
                        setDraftRow((prev) => ({
                          ...prev!,
                          plan_file_id: fileIds[0] ?? null,
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

          <FormActionSection formId={formId} formSave={handleSave} />
        </>
      )}
    </>
  );
}
