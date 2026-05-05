"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { usePrint } from "@/hooks/usePrint";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { MessageCircle, Printer } from "lucide-react";
import { useToast } from "@/context/ToastContext";

type Props = {
  auditId: number;
  formListId: number;
};

type BagOption = {
  team_id: number;
  user_firstname: string;
};

type TableRow = {
  noti_id: number;
  noti_form_id: number;
  ind_id: number;
  ind_group_label: string;
  ind_label: string;
  noti_value: boolean | null;
};

type FormData = {
  form_id: number;
  form_aud_id: number;
  form_list_id: number;
  form_stage: string;
  form_name: string;
  form_code: string;
  form_status_id: number;
  form_status_name: string;
  form_status_code: string;
  form_description?: string | null;
  form_sup_value?: string | null;
  form_file_id?: number | null;
};

export default function Form104({ auditId, formListId }: Props) {
  const [bags, setBags] = useState<BagOption[]>([]);
  const [selectedBag, setSelectedBag] = useState("");

  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    form_id: 0,
    form_aud_id: 0,
    form_list_id: 0,
    form_stage: "",
    form_name: "",
    form_code: "",
    form_status_id: 0,
    form_status_name: "",
    form_status_code: "",
    form_description: null,
    form_sup_value: null,
  });

  const onChange = (id: number, value: boolean) => {
    setData((prev) => prev.map((row) => (row.ind_id === id ? { ...row, noti_value: value } : row)));
  };

  useEffect(() => {
    async function loadBags() {
      const res = await fetchWithAuth("/api/audit/form104/meta?aud_id=" + auditId);
      const result = await res.json();

      setBags(result.data || []);

      if (result.data?.length > 0) {
        setSelectedBag(String(result.data[0].team_id));
      }
    }

    loadBags();
  }, [auditId]);

  useEffect(() => {
    if (!selectedBag) return;

    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(
          `/api/audit/form104?aud_id=${auditId}&team_id=${selectedBag}`
        );
        const result = await res.json();

        setData(Array.isArray(result.data) ? result.data : []);
        setFormId(result.form_id ?? 0);
        setFormData(result.formData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTableData();
  }, [selectedBag, auditId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const noti_data = data.map((row) => ({
        noti_id: row.noti_id,
        ind_id: row.ind_id,
        form_id: formId,
        noti_value: row.noti_value,
      }));

      const res = await fetchWithAuth(`/api/audit/form104/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          noti_data,
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

  const groupedData = (Array.isArray(data) ? data : []).reduce(
    (acc, row) => {
      if (!acc[row.ind_group_label]) {
        acc[row.ind_group_label] = [];
      }
      acc[row.ind_group_label].push(row);
      return acc;
    },
    {} as Record<string, TableRow[]>
  );

  return (
    <>
      <div className="   m-2 flex items-center justify-between gap-4 border-b border-gray-200 bg-white py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <label className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">Баг:</label>

          <select
            value={selectedBag}
            onChange={(e) => setSelectedBag(e.target.value)}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400"
          >
            <option value="">Сонгох</option>
            {bags.map((bag) => (
              <option key={bag.team_id} value={bag.team_id}>
                {bag.user_firstname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  №
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Суурь зарчмууд
                </th>
                <th className="border border-gray-200 p-2 text-left text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тайлбар
                </th>
              </tr>
            </thead>

            {Object.entries(groupedData).map(([groupLabel, rows]) => (
              <tbody key={groupLabel}>
                <tr className="bg-gray-100 dark:bg-gray-800/80">
                  <td
                    colSpan={4}
                    className="border border-gray-200 p-2 font-bold text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    {groupLabel}
                  </td>
                </tr>

                {rows.map((row, index) => (
                  <tr key={row.ind_id} className="bg-white dark:bg-gray-900">
                    <td className="border border-gray-200 p-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {index + 1}
                    </td>

                    <td className="border border-gray-200 p-2 text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {row.ind_label}
                    </td>

                    <td className="border border-gray-200 p-2 dark:border-gray-700">
                      <div className="flex items-center gap-4 text-gray-700 dark:text-gray-200">
                        <label className="flex cursor-pointer items-center gap-1">
                          <input
                            type="radio"
                            name={`noti-${row.ind_id}`}
                            checked={row.noti_value === true}
                            onChange={() => onChange(row.ind_id, true)}
                            className="accent-blue-600 dark:accent-blue-400"
                          />
                          Тийм
                        </label>

                        <label className="flex cursor-pointer items-center gap-1">
                          <input
                            type="radio"
                            name={`noti-${row.ind_id}`}
                            checked={row.noti_value === false}
                            onChange={() => onChange(row.ind_id, false)}
                            className="accent-blue-600 dark:accent-blue-400"
                          />
                          Үгүй
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>

          <FormActionSection
            auditId={auditId}
            formId={formId}
            formListId={formListId}
            formSave={handleSave}
          />
        </>
      )}
    </>
  );
}
