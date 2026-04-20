"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useMemo, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { Delete, Edit } from "lucide-react";
import { RiskCDtype, RiskGroup, RiskSubGroup, RiskType } from "../components/AuditRisk";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import DatePicker from "@/components/form/date-picker";
import { RMainType } from "./Form207";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  risk_id: number;
  risk_aud_id: number;
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
  risk_is_important: boolean | number;

  op_is_fraud?: number | boolean | null;
  op_fraud_reason?: string | null;
  op_is_control?: number | boolean | null;

  op_expected_rate?: string | null;
  op_genre?: number | null;
  op_inspection_rate?: number | null;
  op_effect_rate?: number | null;
  op_is_material?: number | boolean | null;
  op_is_impact?: number | boolean | null;

  resp_main_type_id?: number | null;
  resp_main_type_name?: string | null;
  resp_rtype_id?: number | null;
  resp_sub_rtype_id?: number | null;
  resp_simple_type?: string | null;
  resp_response?: string | null;
  resp_standard_clause?: string | null;
  resp_law_clause?: string | null;
};

type TabKey = "risk" | "op" | "response";

export default function Form301({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("risk");
  const [draftRow, setDraftRow] = useState<Partial<TableRow> | null>(null);

  const [riskTypeList, setRiskTypeList] = useState<RiskType[]>([]);
  const [riskGroupList, setRiskGroupList] = useState<RiskGroup[]>([]);
  const [riskSubGroupList, setRiskSubGroupList] = useState<RiskSubGroup[]>([]);
  const [riskCDTypeList, setRiskCDTypeList] = useState<RiskCDtype[]>([]);
  const [rMainType, setRMainType] = useState<RMainType[]>([]);

  const [loading, setLoading] = useState(true);
  const [dialogSaving, setDialogSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const riskTypeId = Number(draftRow?.risk_type_id);
  const riskIsImportant = Number(draftRow?.risk_is_important);

  const isType1 = riskTypeId === 1;
  const isType2 = riskTypeId === 2 && riskIsImportant === 1;
  const isType3 = riskTypeId === 2 && riskIsImportant === 0;

  const normalizeByType = (row: any) => {
    const typeId = Number(row?.risk_type_id);
    const important = Number(row?.risk_is_important);

    const currentIsType1 = typeId === 1;
    const currentIsType2 = typeId === 2 && important === 1;
    const currentIsType3 = typeId === 2 && important === 0;

    if (currentIsType1) {
      return {
        ...row,

        risk_group_id: null,
        risk_sub_group_id: null,
        risk_cd_type_id: null,

        op_genre: null,
        op_inspection_rate: null,
        op_effect_rate: null,

        op_is_material: null,
        op_is_impact: null,

        resp_rtype_id: null,
        resp_sub_rtype_id: null,
        resp_simple_type: "",
      };
    }

    if (currentIsType2) {
      return {
        ...row,
        op_is_fraud: null,
        op_fraud_reason: "",
        op_is_control: null,

        op_is_material: null,
        op_is_impact: null,
        resp_simple_type: "",
      };
    }

    if (currentIsType3) {
      return {
        ...row,

        op_is_fraud: null,
        op_fraud_reason: "",
        op_is_control: null,

        op_genre: null,
        op_inspection_rate: null,
        op_effect_rate: null,

        resp_main_type_id: null,
        resp_standard_clause: "",
        resp_law_clause: "",
        resp_rtype_id: null,
        resp_sub_rtype_id: null,
      };
    }

    return row;
  };

  const handleDraftChange = (field: string, value: any) => {
    setDraftRow((prev: any) =>
      normalizeByType({
        ...prev,
        [field]: value,
      })
    );
  };

  const resetDialog = () => {
    setDraftRow(null);
  };
  async function loadTableData() {
    try {
      setLoading(true);

      const res = await fetchWithAuth(`/api/audit/form301?aud_id=${auditId}`);
      const result = await res.json();
      console.log(result, "<===result301");

      setData(Array.isArray(result.data) ? result.data : []);
      setFormId(result.form_id ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMetaData() {
    try {
      const resMeta = await fetchWithAuth(`/api/audit/risk/meta`);
      const resultMeta = await resMeta.json();

      const resMainType = await fetchWithAuth("/api/audit/form207/meta");
      const resultMainType = await resMainType.json();

      setRiskTypeList(resultMeta.riskTypes || []);
      setRiskGroupList(resultMeta.groups || []);
      setRiskSubGroupList(resultMeta.subGroups || []);
      setRiskCDTypeList(resultMeta.cdTypes || []);

      setRMainType(resultMainType.response_main_type ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadTableData();
    loadMetaData();
  }, [auditId]);

  const handleDialogSave = async () => {
    if (!draftRow?.risk_content) {
      alert("Эрсдэл оруулна уу");
      return;
    }

    try {
      setDialogSaving(true);

      const riskData = {
        risk_content: draftRow.risk_content,
        risk_type_id: draftRow.risk_type_id,
        risk_group_id: draftRow.risk_group_id,
        risk_sub_group_id: draftRow.risk_sub_group_id,
        risk_cd_type_id: draftRow.risk_cd_type_id,
        risk_is_important: draftRow.risk_is_important,
        op_is_fraud: draftRow.op_is_fraud,
        op_fraud_reason: draftRow.op_fraud_reason,
        op_is_control: draftRow.op_is_control,
        op_genre: draftRow.op_genre,
        op_inspection_rate: draftRow.op_inspection_rate,
        op_effect_rate: draftRow.op_effect_rate,
        op_is_material: draftRow.op_is_material,
        op_is_impact: draftRow.op_is_impact,
        resp_main_type_id: draftRow.resp_main_type_id,
        resp_rtype_id: draftRow.resp_rtype_id,
        resp_sub_rtype_id: draftRow.resp_sub_rtype_id,
        resp_simple_type: draftRow.resp_simple_type,
        resp_response: draftRow.resp_response,
        resp_standard_clause: draftRow.resp_standard_clause,
        resp_law_clause: draftRow.resp_law_clause,
      };
      const res = await fetchWithAuth(`/api/audit/form301`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          form_status_id: 1,
          form_description: 1,
          riskData,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.error || "Мэдээлэл хадгалах үед алдаа гарлаа");
      }

      resetDialog();
      setOpenDialog(false);
      await loadTableData();
    } catch (error) {
      console.error(error);

      alert(error instanceof Error ? error.message : "Мэдээлэл хадгалах үед алдаа гарлаа");
    } finally {
      setDialogSaving(false);
    }
  };

  const handleEditRisk = (row: TableRow) => {
    setDraftRow({
      risk_id: row.risk_id,
      risk_aud_id: row.risk_aud_id,
      risk_source_id: row.risk_source_id,
      risk_date: row.risk_date,
      risk_status_id: row.risk_status_id,
      risk_content: row.risk_content,
      risk_type_id: row.risk_type_id,
      risk_group_id: row.risk_group_id,
      risk_sub_group_id: row.risk_sub_group_id,
      risk_cd_type_id: row.risk_cd_type_id,
      risk_is_important: row.risk_is_important,

      op_is_fraud: row.op_is_fraud,
      op_fraud_reason: row.op_fraud_reason,
      op_is_control: row.op_is_control,

      op_expected_rate: row.op_expected_rate,
      op_genre: row.op_genre,
      op_inspection_rate: row.op_inspection_rate,
      op_effect_rate: row.op_effect_rate,
      op_is_material: row.op_is_material,
      op_is_impact: row.op_is_impact,

      resp_main_type_id: row.resp_main_type_id,
      resp_rtype_id: row.resp_rtype_id,
      resp_sub_rtype_id: row.resp_sub_rtype_id,
      resp_simple_type: row.resp_simple_type,
      resp_response: row.resp_response,
      resp_standard_clause: row.resp_standard_clause,
      resp_law_clause: row.resp_law_clause,
    });

    setOpenDialog(true);
  };

  const handleDeleteRisk = async (riskId: number) => {
    try {
      const res = await fetchWithAuth(`/api/audit/risk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ risk_id: riskId }),
      });

      if (!res.ok) {
        throw new Error("Мөр устгахад алдаа гарлаа");
      }

      await loadTableData();
    } catch (error) {
      console.error(error);
      alert("Мөр устгахад алдаа гарлаа");
    }
  };

  const tabs = useMemo(
    () => [
      { key: "risk" as TabKey, label: "Эрсдэлийн бүртгэл" },
      { key: "op" as TabKey, label: "Эрсдэлийн ерөнхий үнэлгээ" },
      { key: "response" as TabKey, label: "Үнэлсэн эрсдэл хариу өгөх" },
    ],
    []
  );

  return (
    <>
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <>
          <div className="m-2 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={` whitespace-nowrap px-4 py-2 text-sm font-medium transition-all duration-200
            ${
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }
          `}
                      >
                        {tab.label}
                        <span
                          className={`absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full transition-all duration-300
              ${isActive ? "bg-blue-600 dark:bg-blue-400" : "bg-transparent"}
            `}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                resetDialog();
                setDraftRow({});
                setOpenDialog(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              + Нэмэх
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            {activeTab === "risk" && (
              <table className="w-full text-sm text-gray-800 dark:text-gray-200">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="w-10 border px-3 py-2 text-center">№</th>
                    <th className="border px-3 py-2 text-left">Тодорхойлсон эрсдэл</th>
                    <th className="border px-3 py-2 text-left">Эрсдэлийн ангилал</th>
                    <th className="border px-3 py-2 text-left">АГАДҮТ</th>
                    <th className="border px-3 py-2 text-left">Дэд анги</th>
                    <th className="border px-3 py-2 text-left">Батламж мэдэгдэл</th>
                    <th className="border px-3 py-2 text-left">Эх үүсвэр</th>
                    <th className="border px-3 py-2 text-left">Төлөв</th>
                    <th className="border px-3 py-2 text-left">Огноо</th>
                    <th className="border px-3 py-2 text-center">Ач холбогдолтой эсэх</th>
                    <th className="border px-3 py-2 text-center">Үйлдэл</th>
                  </tr>
                </thead>

                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="border px-3 py-6 text-center text-gray-500 dark:text-gray-400"
                      >
                        Мэдээлэл байхгүй байна
                      </td>
                    </tr>
                  ) : (
                    data.map((row, index) => (
                      <tr key={row.risk_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                        {activeTab === "risk" && (
                          <>
                            <td className="border px-3 py-2 text-center">{index + 1}</td>
                            <td className="border px-3 py-2">{row.risk_content}</td>
                            <td className="border px-3 py-2">{row.risk_type_name}</td>
                            <td className="border px-3 py-2">{row.risk_group_name}</td>
                            <td className="border px-3 py-2">{row.risk_sub_group_name}</td>
                            <td className="border px-3 py-2">{row.risk_cd_type_name}</td>
                            <td className="border px-3 py-2">{row.risk_source_name}</td>
                            <td className="border px-3 py-2">{row.risk_status_name}</td>
                            <td className="border px-3 py-2">{row.risk_date}</td>
                            <td className="border px-3 py-2">
                              {row.risk_is_important === 1 ? "Тийм" : "Үгүй"}
                            </td>
                            <td className="border px-3 py-2">
                              <div className="flex items-center justify-center">
                                <a
                                  className="flex w-full cursor-pointer justify-center text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300"
                                  onClick={() => handleEditRisk(row)}
                                  href="#"
                                >
                                  <Edit className="h-4 w-4" />
                                </a>

                                <DeleteConfirmDialog
                                  onConfirm={() => handleDeleteRisk(row.risk_id)}
                                />
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            {activeTab === "op" && (
              <>
                <div className="mb-2">
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      A: Санхүүгийн тайлангийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн
                      үнэлгээ
                    </span>
                  </div>
                  <div>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="w-1/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            №
                          </th>
                          <th className="w-2/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Тодорхойлсон эрсдэл
                          </th>
                          <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Залилангийн эрсдэл гарах магадлалтай эсэх
                          </th>
                          <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Залилангийн эрсдэл гарах шалтгаан
                          </th>
                          <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Дотоод хяналтын тогтолцооны бүрэлдэхүүн хэсгээс үүссэн дутагдал эсэх
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          .filter((row) => row.risk_type_id === 1)
                          .map((rw, index) => (
                            <tr key={rw.risk_id} className="bg-white dark:bg-gray-900">
                              <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                                {index + 1}
                              </td>
                              <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200 flex items-center justify-center">
                                <textarea
                                  readOnly
                                  value={rw.risk_content ?? ""}
                                  className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                                />
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                                {rw.op_is_fraud === 1 ? "Тийм" : "Үгүй"}
                              </td>
                              <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200 flex items-center justify-center">
                                <textarea
                                  readOnly
                                  value={rw.op_fraud_reason || ""}
                                  className="rounded border border-gray-300 w-full field-sizing-content p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                                />
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                                {rw.op_is_control === 1 ? "Тийм" : "Үгүй"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Б: Батламж мэдэгдлийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн үнэлгээ
                    </span>
                  </div>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th
                          rowSpan={2}
                          className="w-1/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                        >
                          №
                        </th>
                        <th
                          rowSpan={2}
                          className="w-2/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                        >
                          Тодорхойлсон эрсдэл
                        </th>
                        <th
                          rowSpan={2}
                          className="w-1/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                        >
                          Уламжлалт эсвэл Хяналтын эрсдэл эсэх
                        </th>
                        <th
                          colSpan={3}
                          className="border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center"
                        >
                          Эрсдэлийн үнэлгээ
                        </th>
                      </tr>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                          Тохиолдох магадлал
                        </th>
                        <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                          Санхүүгийн тайланд үзүүлэх нөлөө
                        </th>
                        <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                          Дундаж үнэлгээ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data
                        .filter((row) => row.risk_type_id === 2 && row.risk_is_important === 1)
                        .map((row, index) => (
                          <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                            <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                              {index + 1}
                            </td>
                            <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200 flex items-center justify-center">
                              <textarea
                                readOnly
                                value={row.risk_content ?? ""}
                                className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                              />
                            </td>
                            <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                            <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                            <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                            <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                          </tr>
                        ))}
                      <tr className="bg-white dark:bg-gray-900">
                        <td
                          colSpan={3}
                          className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        >
                          <span className="text-gray-700 dark:text-gray-200">
                            Уламжлалт эрсдэлийн ерөнхий үнэлгээ
                          </span>
                        </td>
                        <td
                          colSpan={2}
                          className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        ></td>
                        <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-900">
                        <td
                          colSpan={3}
                          className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        >
                          <span className="text-gray-700 dark:text-gray-200">
                            Хяналтын эрсдэлийн ерөнхий үнэлгээ
                          </span>
                        </td>
                        <td
                          colSpan={2}
                          className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        ></td>
                        <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-900">
                        <td
                          colSpan={3}
                          className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        >
                          <span className="text-gray-700 dark:text-gray-200 font-semibold">
                            Материаллаг буруу илэрхийллийн эрсдэлийн үнэлгээ
                          </span>
                        </td>
                        <td
                          colSpan={2}
                          className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        ></td>
                        <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-900">
                        <td
                          colSpan={3}
                          className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        >
                          <span className="text-gray-700 dark:text-gray-200">
                            Аудитын баталгааны түвшин болон эрсдэлийн хэмжээ
                          </span>
                        </td>
                        <td className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                        <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                        <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                      </tr>
                      <tr className="bg-white dark:bg-gray-900">
                        <td
                          colSpan={3}
                          className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        >
                          <span className="text-gray-700 dark:text-gray-200">
                            Илрүүлэлтийн эрсдэлийн хэмжээ
                          </span>
                        </td>
                        <td
                          colSpan={2}
                          className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        ></td>
                        <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200 bg-green-100"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      В: Ач холбогдолтой биш эрсдэлийн үнэлгээ
                    </span>
                  </div>
                  <div>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="w-1/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            №
                          </th>
                          <th className="w-2/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Тодорхойлсон эрсдэл
                          </th>
                          <th className="w-1/4 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Ажил гүйлгээний анги, дансны үлдэгдэл, тодруулгын дэд анги
                          </th>
                          <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Шинж чанарын хувьд материаллаг эсэх
                          </th>
                          <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Материаллаг буруу илэрхийллийн эрсдэлд нөлөөлөх эсэх
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          .filter((row) => row.risk_type_id === 2 && row.risk_is_important === 0)
                          .map((rwb, index) => (
                            <tr key={rwb.risk_id} className="bg-white dark:bg-gray-900">
                              <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                                {index + 1}
                              </td>
                              <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200 h-full">
                                <textarea
                                  readOnly
                                  value={rwb.risk_content ?? ""}
                                  className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                                />
                              </td>
                              <td>
                                <span>
                                  {rwb.risk_group_name} - {rwb.risk_sub_group_name}
                                </span>
                              </td>

                              <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                                {rwb.op_is_material === 1 ? "Тийм" : "Үгүй"}
                              </td>

                              <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                                {rwb.op_is_impact === 1 ? "Тийм" : "Үгүй"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            {activeTab === "response" && (
              <>
                <div className="mb-4">
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      A: Санхүүгийн тайлангийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн
                      үнэлсэн эрсдэлд өгөх хариу
                    </span>
                  </div>
                  <div>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th
                            rowSpan={2}
                            className="w-1/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            №
                          </th>
                          <th
                            rowSpan={2}
                            className="w-1/4 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Тодорхойлсон эрсдэл
                          </th>
                          <th
                            rowSpan={2}
                            className="w-11/100 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Eрөнхий хариу үйлдэл
                          </th>
                          <th
                            rowSpan={2}
                            className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Гүйцэтгэх горим, сорил
                          </th>
                          <th
                            colSpan={2}
                            className="border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Шалгуур үзүүлэлт
                          </th>
                        </tr>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Стандарт заалт
                          </th>
                          <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Хууль тогтоомжийн заалт
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          .filter((row) => row.risk_type_id === 1)
                          .map((row, index) => (
                            <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                              <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                                {index + 1}
                              </td>
                              <td>
                                <textarea
                                  readOnly
                                  value={row.risk_content ?? ""}
                                  className=" w-full field-sizing-content flex items-center justify-center h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                                />
                              </td>
                              <td>{row.resp_main_type_name}</td>
                              <td>{row.resp_response}</td>
                              <td>{row.resp_standard_clause}</td>
                              <td>{row.resp_law_clause}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Б: Батламж мэдэгдлийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн үнэлсэн
                      эрсдэлд өгөх хариу
                    </span>
                  </div>
                  <div>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th
                            rowSpan={2}
                            className="w-1/50 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            №
                          </th>
                          <th
                            rowSpan={2}
                            className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Тодорхойлсон эрсдэл
                          </th>
                          <th
                            rowSpan={2}
                            className="w-2/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            АГАДҮТ-ын дэд анги
                          </th>
                          <th
                            rowSpan={2}
                            className="w-2/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Холбогдох батламж мэдэгдэл
                          </th>
                          <th
                            rowSpan={2}
                            className="w-1/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Горимын шинж чанар
                          </th>
                          <th
                            rowSpan={2}
                            className="w-1/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Хэрэгжүүлэх горим, сорил
                          </th>
                          <th
                            rowSpan={2}
                            className="w-4/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Гүйцэтгэх горим, сорил
                          </th>
                          <th
                            colSpan={2}
                            className="border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                          >
                            Шалгуур үзүүлэлт
                          </th>
                        </tr>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="w-13/100 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Стандарт заалт
                          </th>
                          <th className="w-13/100 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Хууль тогтоомжийн заалт
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          .filter((row) => row.risk_type_id === 2 && row.risk_is_important === 1)
                          .map((row, index) => (
                            <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                              <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                                {index + 1}
                              </td>
                              <td>
                                <textarea
                                  readOnly
                                  value={row.risk_content ?? ""}
                                  className=" w-full field-sizing-content flex items-center justify-center h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                                />
                              </td>
                              <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                                <span className="text-gray-700 dark:text-gray-200 text-center">
                                  {row.risk_group_name} - {row.risk_sub_group_name}
                                </span>
                              </td>

                              <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                                <span className="text-gray-700 dark:text-gray-200 text-center">
                                  {row.risk_cd_type_name}
                                </span>
                              </td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      В: Ач холбогдолтой биш эрсдэлийн үнэлсэн эрсдэлд өгөх хариу
                    </span>
                  </div>
                  <div>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="w-1/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            №
                          </th>
                          <th className="w-9/25 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Тодорхойлсон эрсдэл
                          </th>
                          <th className="w-3/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Хамгийн энгийн бие даасан горим
                          </th>
                          <th className="w-3/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                            Гүйцэтгэх горим, сорил
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          .filter((row) => row.risk_type_id === 2 && row.risk_is_important === 0)
                          .map((row, index) => (
                            <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                              <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                                {index + 1}
                              </td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
          {openDialog && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
              <div className="w-full max-w-6xl rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                    {draftRow?.risk_id ? "Эрсдэл засах" : "Эрсдлийн бүртгэл"}
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      resetDialog();
                      setOpenDialog(false);
                    }}
                    className="text-lg text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    ×
                  </button>
                </div>
                <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-5 py-5">
                  <div className="space-y-6">
                    <section>
                      <div className="mb-4">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          1. Эрсдэл
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Тодорхойлсон эрсдэл
                          </label>
                          <textarea
                            value={draftRow?.risk_content ?? ""}
                            onChange={(e) => handleDraftChange("risk_content", e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Огноо
                          </label>
                          <DatePicker
                            id="risk_date"
                            defaultDate={draftRow?.risk_date ?? ""}
                            onChange={(value: Date[]) =>
                              setDraftRow((prev) => ({
                                ...prev!,
                                risk_date: value?.[0]?.toISOString().slice(0, 10) ?? "",
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Эрсдэлийн ангилал
                          </label>
                          <select
                            value={draftRow?.risk_type_id ?? ""}
                            onChange={(e) =>
                              handleDraftChange("risk_type_id", Number(e.target.value))
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                          >
                            <option value="">Сонгох</option>
                            {riskTypeList.map((item) => (
                              <option key={item.type_id} value={item.type_id}>
                                {item.type_label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Нөлөөлж буй АГАДҮТ
                          </label>
                          <select
                            value={isType1 ? "" : (draftRow?.risk_group_id ?? "")}
                            disabled={isType1}
                            onChange={(e) =>
                              handleDraftChange("risk_group_id", Number(e.target.value))
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                          >
                            <option value="">Сонгох</option>
                            {riskGroupList.map((item) => (
                              <option key={item.group_id} value={item.group_id}>
                                {item.group_label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            АГАДҮТ-н дэд анги
                          </label>
                          <select
                            value={isType1 ? "" : (draftRow?.risk_sub_group_id ?? "")}
                            disabled={isType1}
                            onChange={(e) =>
                              handleDraftChange("risk_sub_group_id", Number(e.target.value))
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                          >
                            <option value="">Сонгох</option>
                            {riskSubGroupList.map((item) => (
                              <option key={item.sub_group_id} value={item.sub_group_id}>
                                {item.sub_group_label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Холбогдох батламж мэдэгдэл
                          </label>
                          <select
                            value={isType1 ? "" : (draftRow?.risk_cd_type_id ?? "")}
                            disabled={isType1}
                            onChange={(e) =>
                              handleDraftChange("risk_cd_type_id", Number(e.target.value))
                            }
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                          >
                            <option value="">Сонгох</option>
                            {riskCDTypeList.map((item) => (
                              <option key={item.cd_type_id} value={item.cd_type_id}>
                                {item.cd_type_label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Ач холбогдолтой эсэх
                          </label>

                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="risk_is_important"
                                checked={Number(draftRow?.risk_is_important) === 1}
                                onChange={(e) => handleDraftChange("risk_is_important", 1)}
                              />
                              Тийм
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="risk_is_important"
                                checked={Number(draftRow?.risk_is_important) === 0}
                                onChange={(e) => handleDraftChange("risk_is_important", 0)}
                              />
                              Үгүй
                            </label>
                          </div>
                        </div>
                      </div>
                    </section>
                    <section>
                      <div className="mb-4">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          2. Үнэлгээ
                        </h4>
                      </div>
                      {isType1 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Залилангийн эрсдэл гарах магадлалтай эсэх
                            </label>

                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="op_is_fraud"
                                  checked={Number(draftRow?.op_is_fraud) === 1}
                                  onChange={(e) => handleDraftChange("op_is_fraud", 1)}
                                />
                                Тийм
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="op_is_fraud"
                                  checked={Number(draftRow?.op_is_fraud) === 0}
                                  onChange={(e) => handleDraftChange("op_is_fraud", 0)}
                                />
                                Үгүй
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Дотоод хяналтын тогтолцооны бүрэлдэхүүн хэсгээс үүссэн дутагдал эсэх
                            </label>

                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="op_is_control"
                                  checked={Number(draftRow?.op_is_control) === 1}
                                  onChange={(e) => handleDraftChange("op_is_control", 1)}
                                />
                                Тийм
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="op_is_control"
                                  checked={Number(draftRow?.op_is_control) === 0}
                                  onChange={(e) => handleDraftChange("op_is_control", 0)}
                                />
                                Үгүй
                              </label>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">
                              Залилангийн эрсдэл гарах шалтгаан
                            </label>

                            <textarea
                              value={draftRow?.op_fraud_reason ?? ""}
                              onChange={(e) => handleDraftChange("op_fraud_reason", e.target.value)}
                              rows={3}
                              className="w-full rounded-xl border px-3 py-2"
                            />
                          </div>
                        </div>
                      )}
                      {isType2 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Уламжлалт эсвэл Хяналтын эрсдэл эсэх
                            </label>

                            <select
                              value={draftRow?.op_genre ?? ""}
                              onChange={(e) =>
                                handleDraftChange("op_genre", Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                            >
                              <option value="">Сонгох</option>
                              <option value={1}>Уламжлалт</option>
                              <option value={2}>Хяналтын</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Тохиолдох магадлал
                            </label>
                            <select
                              value={draftRow?.op_inspection_rate ?? 0}
                              onChange={(e) =>
                                handleDraftChange("op_inspection_rate", Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                            >
                              <option value={0}>Сонгох</option>
                              <option value={0.3}>0.3 - Бага</option>
                              <option value={0.6}>0.6 - Дунд</option>
                              <option value={0.9}>0.9 - Их</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Санхүүгийн тайланд үзүүлэх нөлөө
                            </label>
                            <select
                              value={draftRow?.op_effect_rate ?? 0}
                              onChange={(e) =>
                                handleDraftChange("op_effect_rate", Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                            >
                              <option value={0}>Сонгох</option>
                              <option value={0.3}>0.3 - Бага</option>
                              <option value={0.6}>0.6 - Дунд</option>
                              <option value={0.9}>0.9 - Их</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">Дундаж үнэлгээ</label>
                            <span className="text-gray-700 dark:text-gray-200">
                              {Number(draftRow?.op_inspection_rate) > 0 &&
                              Number(draftRow?.op_effect_rate) > 0
                                ? (
                                    (Number(draftRow?.op_inspection_rate) +
                                      Number(draftRow?.op_effect_rate)) /
                                    2
                                  ).toFixed(2)
                                : "-"}
                            </span>
                          </div>
                        </div>
                      )}
                      {isType3 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Шинж чанарын хувьд материаллаг эсэх
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`material-${draftRow?.risk_id}`}
                                  checked={draftRow?.op_is_material === 1}
                                  onChange={(e) => handleDraftChange("op_is_material", 1)}
                                  className="accent-blue-600 dark:accent-blue-400"
                                />
                                Тийм
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`material-${draftRow?.risk_id}`}
                                  checked={draftRow?.op_is_material === 0}
                                  onChange={(e) => handleDraftChange("op_is_material", 0)}
                                  className="accent-blue-600 dark:accent-blue-400"
                                />
                                Үгүй
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Материаллаг буруу илэрхийллийн эрсдэлд нөлөөлөх эсэх
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`impact-${draftRow?.risk_id}`}
                                  checked={draftRow?.op_is_impact === 1}
                                  onChange={(e) => handleDraftChange("op_is_impact", 1)}
                                  className="accent-blue-600 dark:accent-blue-400"
                                />
                                Тийм
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`impact-${draftRow?.risk_id}`}
                                  checked={draftRow?.op_is_impact === 0}
                                  onChange={(e) => handleDraftChange("op_is_impact", 0)}
                                  className="accent-blue-600 dark:accent-blue-400"
                                />
                                Үгүй
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    <section>
                      <div className="mb-4">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          3. Хариу
                        </h4>
                      </div>
                      {isType1 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Eрөнхий хариу үйлдэл
                            </label>
                            <select
                              value={draftRow?.resp_main_type_id ?? ""}
                              onChange={(e) =>
                                handleDraftChange("resp_main_type_id", Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                            >
                              <option value="">Сонгох</option>
                              {rMainType.map((item) => (
                                <option key={item.main_type_id} value={item.main_type_id}>
                                  {item.main_type_label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Гүйцэтгэх горим, сорил
                            </label>
                            <textarea
                              value={draftRow?.resp_response || ""}
                              onChange={(e) => handleDraftChange("resp_response", e.target.value)}
                              className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">Стандарт заалт</label>
                            <textarea
                              value={draftRow?.resp_standard_clause || ""}
                              onChange={(e) =>
                                handleDraftChange("resp_standard_clause", e.target.value)
                              }
                              className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Хууль тогтоомжийн заалт
                            </label>
                            <textarea
                              value={draftRow?.resp_law_clause || ""}
                              onChange={(e) => handleDraftChange("resp_law_clause", e.target.value)}
                              className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                            />
                          </div>
                        </div>
                      )}
                      {isType2 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Горимын шинж чанар
                            </label>
                            <select
                              value={draftRow?.resp_rtype_id || 0}
                              onChange={(e) =>
                                handleDraftChange("resp_rtype_id", Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                            >
                              <option value={0}>Сонгох</option>
                              <option value={1}>Хяналтад найдах</option>
                              <option value={2}>Биет горим хэрэгжүүлэх</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Хэрэгжүүлэх горим, сорил
                            </label>
                            <select
                              value={draftRow?.resp_sub_rtype_id || 0}
                              onChange={(e) =>
                                handleDraftChange("resp_sub_rtype_id", Number(e.target.value))
                              }
                              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                            >
                              <option value={0}>Сонгоно уу</option>
                              {Number(draftRow?.resp_rtype_id) === 1 && (
                                <option value={1}>Хяналтын сорил</option>
                              )}
                              {Number(draftRow?.resp_rtype_id) === 2 && (
                                <>
                                  <option value={2}>Шинжилгээний горим</option>
                                  <option value={3}>Нарийвчилсан сорил</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Гүйцэтгэх горим, сорил
                            </label>
                            <textarea
                              value={draftRow?.resp_response ?? ""}
                              onChange={(e) => handleDraftChange("resp_response", e.target.value)}
                              className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">Стандарт заалт</label>
                            <textarea
                              value={draftRow?.resp_standard_clause ?? ""}
                              onChange={(e) =>
                                handleDraftChange("resp_standard_clause", e.target.value)
                              }
                              className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Хууль тогтоомжийн заалт
                            </label>
                            <textarea
                              value={draftRow?.resp_law_clause || ""}
                              onChange={(e) => handleDraftChange("resp_law_clause", e.target.value)}
                              className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                            />
                          </div>
                        </div>
                      )}
                      {isType3 && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Хамгийн энгийн бие даасан горим
                            </label>
                            <textarea
                              value={draftRow?.resp_simple_type ?? ""}
                              onChange={(e) =>
                                handleDraftChange("resp_simple_type", e.target.value)
                              }
                              className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              Гүйцэтгэх горим, сорил
                            </label>
                            <textarea
                              value={draftRow?.resp_response ?? ""}
                              onChange={(e) => handleDraftChange("resp_response", e.target.value)}
                              className="rounded border border-gray-300 w-full field-sizing-content min-h-18 p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                            />
                          </div>
                        </div>
                      )}
                    </section>

                    <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => {
                          resetDialog();
                          setOpenDialog(false);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Болих
                      </button>

                      <button
                        type="button"
                        onClick={handleDialogSave}
                        disabled={dialogSaving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
                      >
                        {dialogSaving ? "Хадгалж байна..." : "Хадгалах"}
                      </button>
                    </div>
                  </div>
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
