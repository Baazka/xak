"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useMemo, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { MessageCircle, Printer } from "lucide-react";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import ExpandableDataTable, { Column } from "@/components/tables/ExpandableTable";
import { F308_DATA_MAP1, F308_DATA_MAP2 } from "@/utils/constSelect";

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

export default function Form308({ auditId, formListId }: Props) {
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

        const res = await fetchWithAuth(`/api/audit/form308?aud_id=${auditId}`);
        const result = await res.json();
        console.log(result, "<====result308");

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
          aud_id: auditId,
          form_id: formId,
          form_status_id: 1,
          form_description: "desc",
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
  };

  const updateRow = (riskId: number, patch: Partial<TableRow>) => {
    setData((prev) => prev.map((row) => (row.risk_id === riskId ? { ...row, ...patch } : row)));
  };

  const importantRows = useMemo(
    () => data.filter((row) => row.risk_type_id === 2 && row.risk_is_important === 1),
    [data]
  );

  const normalRows = useMemo(
    () => data.filter((row) => !(row.risk_type_id === 2 && row.risk_is_important === 1)),
    [data]
  );

  const columns: Column<TableRow>[] = [
    {
      key: "no",
      title: "№",
      width: "60px",
      className: "text-center",
      render: (_row, index) => index + 1,
    },
    {
      key: "risk_content",
      title: "Тодорхойлсон эрсдэл",
      width: "26%",
      render: (row) => (
        <div className="whitespace-pre-wrap break-words text-sm">{row.risk_content || "-"}</div>
      ),
    },
    {
      key: "rf_effect",
      title: "Үр дагавар",
      width: "20%",
      render: (row) => (
        <div className="whitespace-pre-wrap break-words text-sm">{row.rf_effect || "-"}</div>
      ),
    },
    {
      key: "rf_amount",
      title: "Мөнгөн дүн",
      width: "120px",
      render: (row) => <div className="text-right">{row.rf_amount ?? ""}</div>,
    },
    {
      key: "fs_solution_id",
      title: "Гаргасан шийдэл",
      width: "180px",
      render: (row) => row.fs_solution_name || "-",
    },
    {
      key: "fs_type_id",
      title: "Алдаа, зөрчлийн ангилал",
      width: "160px",
      render: (row) => row.fs_type_name || "-",
    },
  ];

  const renderExpanded = (row: TableRow) => (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
            Стандартын заалт
          </label>
          <textarea
            readOnly
            value={row.rf_standard_clause || ""}
            className="min-h-[88px] w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
            Хууль тогтоомжийн заалт
          </label>
          <textarea
            readOnly
            value={row.rf_law_clause || ""}
            className="min-h-[88px] w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
            Аудитын байгууллагын тогтоосон акт, албан шаардлага, зөвлөмжийн товч утга
          </label>
          <textarea
            value={row.fs_subject || ""}
            onChange={(e) => updateRow(row.risk_id, { fs_subject: e.target.value })}
            className="min-h-[110px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
            Гаргасан шийдэл
          </label>
          <select
            value={row.fs_solution_id ?? ""}
            onChange={(e) =>
              updateRow(row.risk_id, {
                fs_solution_id: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
          >
            <option value="">Сонгох</option>
            {Object.entries(F308_DATA_MAP1).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
            Шийдлийн заалт
          </label>
          <textarea
            value={row.fs_solution_clause || ""}
            onChange={(e) => updateRow(row.risk_id, { fs_solution_clause: e.target.value })}
            className="min-h-[110px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
            Алдаа, зөрчлийн ангилал
          </label>
          <select
            value={row.fs_type_id ?? ""}
            onChange={(e) =>
              updateRow(row.risk_id, {
                fs_type_id: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
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
        </div>
      </div>
    </div>
  );

  return (
    <>
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <>
          <div className="flex items-center justify-end gap-2 mb-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
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

          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Эрсдэлтэй АГАДҮТ-н түвшинд хэрэгжүүлэх түүврийн сорилын алдааг үнэлэх
          </h2>
          <ExpandableDataTable
            data={importantRows}
            columns={columns}
            getRowId={(row) => row.risk_id}
            renderExpanded={renderExpanded}
          />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Санхүүгийн тайлангийн түвшинд болон ач холбогдолтой биш эрсдэлүүдэд хэрэгжүүлэх горим,
            сорилын үр дүн үнэлэх
          </h2>
          <ExpandableDataTable
            data={normalRows}
            columns={columns}
            getRowId={(row) => row.risk_id}
            renderExpanded={renderExpanded}
          />

          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
