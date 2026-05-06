"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import AuditRisk from "../components/AuditRisk";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import { MessageCircle, Printer } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  risk_id: number;
  risk_form_id: number;
  risk_is_important: boolean;
  risk_source_id: number;

  risk_source_name: string;
  risk_date: string | null;
  risk_status_id: number;
  risk_status_name: string;
  risk_content: string;
  risk_type_id: number;
  risk_type_name: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  risk_cd_type_id: number;
  risk_cd_type_name: string;
};

export default function Form204({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();
  const { toast } = useToast();

  const onChange = (id: number, value: boolean) => {
    setData((prev) =>
      prev.map((row) => (row.risk_id === id ? { ...row, risk_is_important: value } : row))
    );
  };

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form204?aud_id=${auditId}`);
        const result = await res.json();

        const normalizedData = Array.isArray(result.data)
          ? result.data.map((row: any) => ({
              ...row,
              risk_is_important: row.risk_is_important === 1 || row.risk_is_important === true,
            }))
          : [];

        setData(normalizedData);
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

      const importantData = data.map((row) => ({
        riskId: row.risk_id,
        riskIsImportant: row.risk_is_important ? 1 : 0,
      }));

      const res = await fetchWithAuth(`/api/audit/form204/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formId,
          importantData,
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

  return (
    <>
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <>
          <div className="space-y-3 rounded">
            <table className="w-full text-sm text-gray-800 dark:text-gray-200">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="w-10 border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                    №
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left dark:border-gray-700">
                    Тодорхойлсон эрсдэл
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left dark:border-gray-700">
                    Эрсдэлийн ангилал
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left dark:border-gray-700">
                    Нөлөөлж буй АГАДҮТ
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left dark:border-gray-700">
                    АГАДҮТ-н дэд анги
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left dark:border-gray-700">
                    Холбогдох батламж мэдэгдлүүд
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left dark:border-gray-700">
                    Огноо
                  </th>
                  <th className="w-24 border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                    Ач холбогдолтой эсэх
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
                    <tr key={row.risk_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                        {index + 1}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 dark:border-gray-700">
                        {row.risk_content}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 dark:border-gray-700">
                        {row.risk_type_name}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                        {row.risk_group_name}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                        {row.risk_sub_group_name}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                        {row.risk_cd_type_name}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                        {row.risk_date}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                        <div className="flex items-center gap-4 text-gray-700 dark:text-gray-200">
                          <label className="flex cursor-pointer items-center gap-1">
                            <input
                              type="radio"
                              name={`noti-${row.risk_id}`}
                              checked={row.risk_is_important === true}
                              onChange={() => onChange(row.risk_id, true)}
                              className="accent-blue-600 dark:accent-blue-400"
                            />
                            Тийм
                          </label>

                          <label className="flex cursor-pointer items-center gap-1">
                            <input
                              type="radio"
                              name={`noti-${row.risk_id}`}
                              checked={row.risk_is_important === false}
                              onChange={() => onChange(row.risk_id, false)}
                              className="accent-blue-600 dark:accent-blue-400"
                            />
                            Үгүй
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <FormActionSection formId={formId} formSave={handleSave} />
        </>
      )}
    </>
  );
}
