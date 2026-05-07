"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useMemo, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import ExpandableDataTable, { Column } from "@/components/tables/ExpandableTable";
import {
  F304_DATA_MAP1,
  F305_DATA_MAP1,
  F308_DATA_MAP1,
  F308_DATA_MAP2,
} from "@/utils/constSelect";
import { formatCurrency } from "@/lib/formatCurrency";
import SkeletonCard from "../components/SkeletonCard";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  risk_id: number;
  fc_form_id: number;
  risk_type_id: number;
  risk_type_name: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  risk_cd_type_id: number;
  risk_cd_type_name: string;
  risk_content: string;
  res_result: string;
  res_fault_level: number;
  rf_effect: string;
  rf_amount: number;
  rf_type_id: number;
  rf_is_material: number;
  rf_correctable: number;
  rf_standard_clause: string;
  rf_law_clause: string;

  fs_subject: string;
  fs_solution_id: number;
  fs_solution_name: string;
  fs_solution_clause: string;
  fs_type_id: number;
  fs_type_name: string;
  risk_is_important: number;
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

export default function Form308({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
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

  const [refresher, setRefresher] = useState(0);

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form308?aud_id=${auditId}`);
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
  }, [auditId, refresher]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const solutionData = data.map((row) => ({
        risk_id: row.risk_id,
        fs_subject: row.fs_subject,
        fs_solution_id: row.fs_solution_id,
        fs_solution_clause: row.fs_solution_clause,
        fs_type_id: row.fs_type_id,
      }));

      const res = await fetchWithAuth(`/api/audit/form308/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formId,
          solutionData,
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
    setRefresher((prev) => prev + 1);
  };

  const updateRow = <K extends keyof TableRow>(riskId: number, field: K, value: TableRow[K]) => {
    setData((prev) =>
      prev.map((row) => (row.risk_id === riskId ? { ...row, [field]: value } : row))
    );
  };

  const importantRows = useMemo(
    () => data.filter((row) => row.risk_type_id === 2 && row.risk_is_important === 1),
    [data]
  );

  const normalRows = useMemo(
    () => data.filter((row) => !(row.risk_type_id === 2 && row.risk_is_important === 1)),
    [data]
  );

  const columns308A: Column<TableRow>[] = [
    {
      key: "no",
      title: "№",
      width: "50px",
      className: "text-center",
      render: (_row, index) => index + 1,
    },
    {
      key: "risk_content",
      title: "Тодорхойлсон эрсдэл",
      width: "20%",
    },
    {
      key: "risk_group_name",
      title: "Нөлөөлж буй АГАДҮТ",
    },
    {
      key: "risk_sub_group_name",
      title: "АГАДҮТ-н дэд анги",
    },
    {
      key: "rf_effect",
      title: "Үр дагавар",
    },
    {
      key: "res_result",
      title: "Товч утга",
    },
    {
      key: "res_fault_level",
      title: "Тухайн үр дүнг алдаа зөрчилд тооцох эсэх",
      render: (row) => {
        return F304_DATA_MAP1[String(row.res_fault_level ?? "-")] ?? "-";
      },
      className: "w-[50px]",
    },
    {
      key: "rf_amount",
      title: "Мөнгөн дүн",
      render: (row) => {
        return formatCurrency(row.rf_amount) ?? "-";
      },
    },
    {
      key: "rf_is_material",
      title: "Материаллаг эсэх",
      render: (row) => {
        return F305_DATA_MAP1[String(row.rf_is_material ?? "-")] ?? "-";
      },
    },
    {
      key: "rf_standard_clause",
      title: "Стандартын заалт",
    },
    {
      key: "rf_law_clause",
      title: "Хууль тогтоомжийн заалт",
    },
  ];

  const columns308B: Column<TableRow>[] = [
    {
      key: "no",
      title: "№",
      width: "50px",
      className: "text-center",
      render: (_row, index) => index + 1,
    },
    {
      key: "risk_content",
      title: "Тодорхойлсон эрсдэл",
      width: "20%",
    },
    {
      key: "rf_effect",
      title: "Үр дагавар",
    },
    {
      key: "res_result",
      title: "Товч утга",
    },
    {
      key: "res_fault_level",
      title: "Тухайн үр дүнг алдаа зөрчилд тооцох эсэх",
      render: (row) => {
        return F304_DATA_MAP1[String(row.res_fault_level ?? "-")] ?? "-";
      },
      className: "w-[50px]",
    },
    {
      key: "rf_amount",
      title: "Мөнгөн дүн",
      render: (row) => {
        return formatCurrency(row.rf_amount) ?? "-";
      },
    },
    {
      key: "rf_is_material",
      title: "Материаллаг эсэх",
      render: (row) => {
        return F305_DATA_MAP1[String(row.rf_is_material ?? "-")] ?? "-";
      },
    },
    {
      key: "rf_standard_clause",
      title: "Стандартын заалт",
    },
    {
      key: "rf_law_clause",
      title: "Хууль тогтоомжийн заалт",
    },
  ];

  const renderExpanded = (row: TableRow) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            <th className="w-2/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
              Аудитын байгууллагын тогтоосон акт, албан шаардлага, зөвлөмжийн товч утга
            </th>
            <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
              Гаргасан шийдэл
            </th>
            <th className="w-2/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
              Шийдлийн заалт
            </th>
            <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
              Алдаа, зөрчлийн ангилал
            </th>
          </tr>
        </thead>
        <tbody>
          <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
            <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <textarea
                rows={1}
                value={row.fs_subject || ""}
                onChange={(e) => updateRow(row.risk_id, "fs_subject", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
              />
            </td>
            <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <select
                value={row.fs_solution_id ?? ""}
                onChange={(e) => updateRow(row.risk_id, "fs_solution_id", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2  text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
              >
                <option value="">Сонгох</option>
                {Object.entries(F308_DATA_MAP1).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </td>
            <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <textarea
                rows={1}
                value={row.fs_solution_clause || ""}
                onChange={(e) => updateRow(row.risk_id, "fs_solution_clause", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
              />
            </td>
            <td className="border border-gray-200 p-2 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <select
                value={row.fs_type_id ?? ""}
                onChange={(e) => updateRow(row.risk_id, "fs_type_id", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
              >
                <option value="">Сонгох</option>
                {Object.entries(F308_DATA_MAP2[String(row.fs_solution_id)] ?? {}).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {loading ? (
        <SkeletonCard />
      ) : (
        <>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Эрсдэлтэй АГАДҮТ-н түвшинд хэрэгжүүлэх түүврийн сорилын алдааг үнэлэх
          </h2>
          <ExpandableDataTable
            data={importantRows}
            columns={columns308A}
            getRowId={(row) => row.risk_id}
            renderExpanded={renderExpanded}
          />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Санхүүгийн тайлангийн түвшинд болон ач холбогдолтой биш эрсдэлүүдэд хэрэгжүүлэх горим,
            сорилын үр дүн үнэлэх
          </h2>
          <ExpandableDataTable
            data={normalRows}
            columns={columns308B}
            getRowId={(row) => row.risk_id}
            renderExpanded={renderExpanded}
          />
          <FormActionSection formId={formId} formSave={handleSave} />
        </>
      )}
    </>
  );
}
