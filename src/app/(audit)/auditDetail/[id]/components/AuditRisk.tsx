"use client";

import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import DatePicker from "@/components/form/DatePicker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Delete, Edit } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Props = {
  auditId: number;
  formListId: number;
};

type RiskType = {
  type_id: number;
  type_label: string;
};
type RiskGroup = {
  group_id: number;
  group_label: string;
};
type RiskSubGroup = {
  sub_group_id: number;
  sub_group_label: string;
};
type RiskCDtype = {
  cd_type_id: number;
  cd_type_label: string;
};

type RiskRow = {
  risk_id: number;
  risk_aud_id: number;
  risk_source_id: number;
  risk_source_name: string;
  risk_date: string;
  risk_status_id: number;
  risk_status_name: string;
  risk_type_id: number;
  risk_type_name: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  risk_cd_type_id: number;
  risk_cd_type_name: string;
  risk_content: string;
};

export default function AuditRisk({ auditId, formListId }: Props) {
  const [riskList, setRiskList] = useState<RiskRow[]>([]);
  const [draftRow, setDraftRow] = useState<Partial<RiskRow> | null>(null);

  const [riskTypeList, setRiskTypeList] = useState<RiskType[]>([]);
  const [riskGroupList, setRiskGroupList] = useState<RiskGroup[]>([]);
  const [riskSubGroupList, setRiskSubGroupList] = useState<RiskSubGroup[]>([]);
  const [riskCDTypeList, setRiskCDTypeList] = useState<RiskCDtype[]>([]);

  const [loading, setLoading] = useState(true);
  const [dialogSaving, setDialogSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const resetDialog = () => {
    setDraftRow(null);
  };

  const loadTableData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetchWithAuth(
        `/api/audit/risk?aud_id=${auditId}&risk_source_id=${formListId}`
      );
      const result = await res.json();

      const resMeta = await fetchWithAuth(`/api/audit/risk/meta`);
      const resultMeta = await resMeta.json();

      setRiskList(result.data || []);

      setRiskTypeList(resultMeta.riskTypes || []);
      setRiskGroupList(resultMeta.groups || []);
      setRiskSubGroupList(resultMeta.subGroups || []);
      setRiskCDTypeList(resultMeta.cdTypes || []);
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
    if (!draftRow?.risk_content) {
      alert("Эрсдэл оруулна уу");
      return;
    }

    try {
      setDialogSaving(true);

      const res = await fetchWithAuth(`/api/audit/risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          risk_id: draftRow.risk_id,
          risk_aud_id: auditId,
          risk_source_id: formListId,
          risk_date: draftRow.risk_date,
          risk_status_id: 1,
          risk_type_id: draftRow.risk_type_id,
          risk_group_id: draftRow.risk_group_id,
          risk_sub_group_id: draftRow.risk_sub_group_id,
          risk_cd_type_id: draftRow.risk_cd_type_id,
          risk_content: draftRow.risk_content,
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

  const handleEditRisk = (row: RiskRow) => {
    setDraftRow({
      risk_id: row.risk_id,
      risk_aud_id: row.risk_aud_id,
      risk_source_id: row.risk_source_id,
      risk_date: row.risk_date,
      risk_status_id: row.risk_status_id,
      risk_type_id: row.risk_type_id,
      risk_group_id: row.risk_group_id,
      risk_sub_group_id: row.risk_sub_group_id,
      risk_cd_type_id: row.risk_cd_type_id,
      risk_content: row.risk_content,
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

  const isType1 = draftRow?.risk_type_id === 1;

  if (loading) {
    return <div>Уншиж байна...</div>;
  }

  return (
    <div className="space-y-3 mt-3">
      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
          <div className="text-sm font-semibold">Эрсдлийн бүртгэл</div>

          <button
            type="button"
            onClick={() => {
              resetDialog();
              setDraftRow({});
              setOpenDialog(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Нэмэх
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-center w-10">№</th>
                <th className="border px-3 py-2 text-left">Тодорхойлсон эрсдэл</th>
                <th className="border px-3 py-2 text-left">Эрсдэлийн ангилал</th>
                <th className="border px-3 py-2 text-left">Нөлөөлж буй АГАДҮТ</th>
                <th className="border px-3 py-2 text-left">АГАДҮТ-н дэд анги</th>
                <th className="border px-3 py-2 text-left">Холбогдох батламж мэдэгдлүүд</th>
                <th className="border px-3 py-2 text-left">Огноо</th>
                <th className="border px-3 py-2 text-center w-24">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {riskList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="border px-3 py-6 text-center text-gray-500">
                    Мэдээлэл байхгүй байна
                  </td>
                </tr>
              ) : (
                riskList.map((row, index) => (
                  <tr key={row.risk_id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 text-center">{index + 1}</td>
                    <td className="border px-3 py-2">{row.risk_content}</td>
                    <td className="border px-3 py-2">{row.risk_type_name}</td>
                    <td className="border px-3 py-2 text-center">{row.risk_group_name}</td>
                    <td className="border px-3 py-2 text-center">{row.risk_sub_group_name}</td>
                    <td className="border px-3 py-2 text-center">{row.risk_cd_type_name}</td>
                    <td className="border px-3 py-2 text-center">{row.risk_date}</td>
                    <td className="border px-3 py-2 text-center">
                      <div className="flex items-center justify-center">
                        <a
                          className="flex w-full justify-center text-yellow-500 cursor-pointer"
                          onClick={() => handleEditRisk(row)}
                          href="#"
                        >
                          <Edit className="h-4 w-4" />
                        </a>

                        <DeleteConfirmDialog onConfirm={() => handleDeleteRisk(row.risk_id)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openDialog && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-base font-semibold">
                {draftRow?.risk_id ? "Эрсдэл засах" : "Эрсдлийн бүртгэл"}
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
                <label className="mb-1 block text-sm font-medium">Тодорхойлсон эрсдэл</label>
                <textarea
                  value={draftRow?.risk_content ?? ""}
                  onChange={(e) =>
                    setDraftRow((prev) => ({
                      ...prev!,
                      risk_content: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Огноо</label>
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
                <label className="mb-1 block text-sm font-medium">Эрсдэлийн ангилал</label>
                <select
                  value={draftRow?.risk_type_id ?? ""}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    setDraftRow((prev) => ({
                      ...prev!,
                      risk_type_id: value,

                      ...(value === 1 && {
                        risk_group_id: undefined,
                        risk_sub_group_id: undefined,
                        risk_cd_type_id: undefined,
                      }),
                    }));
                  }}
                  className="w-full rounded-lg border px-3 py-2"
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
                <label className="mb-1 block text-sm font-medium">Нөлөөлж буй АГАДҮТ</label>
                <select
                  value={isType1 ? "" : (draftRow?.risk_group_id ?? "")}
                  disabled={isType1}
                  onChange={(e) =>
                    setDraftRow((prev) => ({
                      ...prev!,
                      risk_group_id: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
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
                <label className="mb-1 block text-sm font-medium">АГАДҮТ-н дэд анги</label>
                <select
                  value={isType1 ? "" : (draftRow?.risk_sub_group_id ?? "")}
                  disabled={isType1}
                  onChange={(e) =>
                    setDraftRow((prev) => ({
                      ...prev!,
                      risk_sub_group_id: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
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
                <label className="mb-1 block text-sm font-medium">
                  Холбогдох батламж мэдэгдлүүд
                </label>
                <select
                  value={isType1 ? "" : (draftRow?.risk_cd_type_id ?? "")}
                  disabled={isType1}
                  onChange={(e) =>
                    setDraftRow((prev) => ({
                      ...prev!,
                      risk_cd_type_id: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Сонгох</option>
                  {riskCDTypeList.map((item) => (
                    <option key={item.cd_type_id} value={item.cd_type_id}>
                      {item.cd_type_label}
                    </option>
                  ))}
                </select>
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
