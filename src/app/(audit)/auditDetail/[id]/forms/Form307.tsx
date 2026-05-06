"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import { MessageCircle, Printer } from "lucide-react";
import { F307_DATA_MAP1 } from "@/utils/constSelect";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  fp_id: number;
  fp_form_id: number;
  fp_ind_id: number;
  ind_label: string;
  fp_type_id: number | null;
  fp_ind_value: string | null;
};

export default function Form307({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();
  const { toast } = useToast();

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form307?aud_id=${auditId}`);
        const result = await res.json();
        console.log(result, "<====result307");

        setData(Array.isArray(result.data) ? result.data : []);
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

      const fp_data = data.map((row) => ({
        fp_id: row.fp_id,
        fp_ind_id: row.fp_ind_id,
        fp_type_id: row.fp_type_id,
        fp_ind_value: row.fp_ind_value,
      }));

      const res = await fetchWithAuth(`/api/audit/form307/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formId,
          fp_data,
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
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="w-[30px] border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  №
                </th>
                <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Дуусгавар болгох горимууд
                </th>
                <th className=" border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Хэрэгжүүлэх горим, сорилын тайлбар
                </th>
                <th className="w-3/5 border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Горим, сорилын үр дүн
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.fp_id} className="bg-white dark:bg-gray-900">
                  <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {index + 1}
                  </td>
                  <td className=" border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    {row.ind_label}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                    <select
                      value={row.fp_type_id ?? ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.fp_id === row.fp_id
                              ? {
                                  ...r,
                                  fp_type_id: e.target.value === "" ? 0 : Number(e.target.value),
                                }
                              : r
                          )
                        )
                      }
                      className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                    >
                      <option value="">Сонгох</option>
                      {Object.entries(F307_DATA_MAP1).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className=" border border-gray-200 p-2 dark:border-gray-700">
                    <textarea
                      value={row.fp_ind_value || ""}
                      onChange={(e) =>
                        setData((prev) =>
                          prev.map((r) =>
                            r.fp_id === row.fp_id ? { ...r, fp_ind_value: e.target.value } : r
                          )
                        )
                      }
                      className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <FormActionSection formId={formId} formSave={handleSave} />
        </>
      )}
    </>
  );
}
