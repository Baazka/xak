"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { MessageCircle, Printer } from "lucide-react";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import { formatCurrency } from "@/lib/formatCurrency";
import FileUpload, { UploadedFileItem } from "@/components/ui/FileUpload";

type Props = {
  auditId: number;
  formListId: number;
};

export type ConclusionType = {
  type_id: number;
  type_label: string;
};

type Data = {
  con_id: number | null;
  con_form_id: number | null;
  con_type_id: number | null;
  con_type_name: string;
  con_base: string | null;
  con_file_id: number | null;
};

type Info = {
  aldaa_count: number | null;
  con_form_id: number | null;
  corp_exec_val: number | null;
  corp_val: number | null;
  corrected_amount: number | null;
  material_count: number | null;
  not_material_count: number | null;
  other_count: number | null;
  uncorrected_amount: number | null;
  zorchil_count: number | null;
};

export default function Form401({ auditId, formListId }: Props) {
  const [data, setData] = useState<Data>({
    con_id: null,
    con_form_id: null,
    con_type_id: null,
    con_type_name: "",
    con_base: "",
    con_file_id: null,
  });
  const [info, setInfo] = useState<Info>();
  const [conclusionType, setConclusionType] = useState<ConclusionType[]>([]);
  const [conclusionTypeId, setConclusionTypeId] = useState<number | null>(null);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();
  const { toast } = useToast();

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form401?aud_id=${auditId}`);
        const result = await res.json();

        const resMeta = await fetchWithAuth(`/api/audit/form401/meta`);
        const resultMeta = await resMeta.json();

        console.log(result, "<====result401");
        setData(result.data?.[0] ?? {});
        setInfo(result.info?.[0] ?? {});
        setConclusionType(
          Array.isArray(resultMeta.response_conclusion_type)
            ? resultMeta.response_conclusion_type
            : []
        );
        setFormId(result.form_id ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTableData();
  }, [auditId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetchWithAuth(`/api/audit/form401/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formId,
          con_id: data?.con_id ?? null,
          con_type_id: conclusionTypeId,
          con_file_id: data?.con_file_id ?? null,
          con_base: data.con_base,
        }),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }

      toast("success", "Амжилттай хадгаллаа");
    } catch (error) {
      console.error(error);
      toast("error", "Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const StatItem = ({
    label,
    value,
    highlight = false,
  }: {
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
  }) => (
    <div className="flex items-center justify-between text-medium">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
  return (
    <>
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <>
          <div className="p-4 text-sm text-gray-900 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StatItem
                label="Тогтоосон материаллаг байдал"
                value={formatCurrency(info?.corp_val ?? 0)}
              />

              <StatItem
                label="Гүйцэтгэлийн материаллаг байдал"
                value={formatCurrency(info?.corp_exec_val ?? 0)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatItem label="Материаллаг" value={Number(info?.material_count ?? 0)} />
              <StatItem label="Материаллаг бус" value={Number(info?.not_material_count ?? 0)} />
              <StatItem
                label="Шинж чанарын хувьд материаллаг"
                value={Number(info?.other_count ?? 0)}
              />
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatItem
                  label="Нийт алдааны дүн"
                  value={formatCurrency(
                    Number(info?.corrected_amount ?? 0) + Number(info?.uncorrected_amount ?? 0)
                  )}
                />

                <StatItem
                  label="Залруулсан алдааны дүн"
                  value={formatCurrency(info?.corrected_amount ?? 0)}
                />

                <StatItem
                  label="Залруулаагүй алдааны дүн"
                  value={formatCurrency(info?.uncorrected_amount ?? 0)}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatItem label="Нийт алдаа" value={Number(info?.aldaa_count ?? 0)} />
                <StatItem label="Нийт зөрчил" value={Number(info?.zorchil_count ?? 0)} />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-800 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block  font-medium text-gray-600 dark:text-gray-400">
                  Аудитын дүгнэлт
                </label>

                <select
                  value={conclusionTypeId ?? ""}
                  onChange={(e) => setConclusionTypeId(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                >
                  <option value="">Сонгох</option>
                  {conclusionType.map((item) => (
                    <option key={item.type_id} value={item.type_id}>
                      {item.type_label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block font-medium text-gray-600 dark:text-gray-400">
                  Хавсралт
                </label>

                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950">
                  <FileUpload
                    accept=".pdf,.doc,.docx"
                    multiple={false}
                    auditId={auditId}
                    value={files}
                    onChange={setFiles}
                    onUploaded={(fileIds) => {
                      setData((prev) => {
                        if (!prev) return prev;

                        return {
                          ...prev,
                          con_file_id: fileIds[0] ?? null,
                        };
                      });
                    }}
                    onRemove={async (file) => {
                      setData((prev) => {
                        if (!prev) return prev;

                        return {
                          ...prev,
                          con_file_id: null,
                        };
                      });

                      if (file.file_id) {
                        await fetch(`/api/files/delete/${file.file_id}`, {
                          method: "DELETE",
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-medium text-gray-600 dark:text-gray-400">
                Дүгнэлтийн үндэслэл
              </label>
              <textarea
                value={data?.con_base ?? ""}
                onChange={(e) => {
                  setData({ ...data, con_base: e.target.value });
                }}
                className="min-h-24 field-sizing-content w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                placeholder="Дүгнэлтийн үндэслэлээ энд бичнэ үү..."
              />
            </div>
          </div>

          <FormActionSection formId={formId} formSave={handleSave} />
        </>
      )}
    </>
  );
}
