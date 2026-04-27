"use client";

import * as React from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { InvoiceList } from "../types";
import Select from "react-select";
import { useToast } from "@/context/ToastContext";
import { FormErrors, ValidationSchema, validateForm } from "@/utils/validation";
import NumberStepper from "@/components/form/NumberStepper";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  mode: "create" | "edit";
  initialInvoice?: Pick<
    InvoiceList,
    | "inv_id"
    | "inv_org_id"
    | "inv_type_id"
    | "inv_aud_count"
    | "inv_amount"
    | "org_register_no"
    | "org_legal_name"
  > | null;

  onSaved?: () => void;
};

type orgListType = {
  org_id: number;
  org_register_no: string;
  org_legal_name: string;
};

type orgList = {
  value: number;
  label: string;
};

type InvoiceFormData = {
  org_id: number | "";
  inv_type_id: number | "";
  inv_aud_count: number | "";
  inv_aud_amount: number | "";
};

const invoiceSchema: ValidationSchema<InvoiceFormData> = {
  org_id: { required: true, label: "Байгууллага" },
  inv_type_id: { required: true, label: "Нэхэмжлэхийн төрөл" },
  inv_aud_count: { required: true, label: "Аудитын эрхийн тоо" },
  inv_aud_amount: { required: true, label: "Нэхэмжлэлийн нийт дүн" },
};

export default function insertInvoiceDialog({
  open,
  onOpenChange,
  mode,
  initialInvoice,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const isEdit = mode === "edit";

  const [orgId, setOrgId] = React.useState<number | "">("");
  const [realorg, setRealorg] = React.useState<orgList[]>([]);

  const [invTypeId, setInvTypeId] = React.useState<number | "">("");
  const [audCount, setAudCount] = React.useState<number | "">("");
  const [invAmount, setInvAmount] = React.useState<number | "">("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors<InvoiceFormData>>({});

  const inputClass = "w-full rounded border px-3 py-2";
  const normalClass = "border-gray-300";
  const errorClass = "border-red-500";

  const getInputClass = (field: keyof InvoiceFormData) =>
    `${inputClass} ${errors[field] ? errorClass : normalClass}`;

  const clearError = (field: keyof InvoiceFormData) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const renderError = (field: keyof InvoiceFormData) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  React.useEffect(() => {
    const loadMeta = async () => {
      try {
        setMetaLoading(true);

        const res = await fetchWithAuth("/api/notifications/meta", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to load metadata");
        }
        const data = await res.json();
        const orgList: orgListType[] = data.orgs ?? [];

        setRealorg(
          orgList.map((e) => {
            return {
              value: e.org_id,
              label: `<strong>${e.org_register_no}</strong> ${e.org_legal_name}`,
            };
          })
        );

        setOrgId("");
        setSelectedVal([]);
      } catch (error) {
        console.error(error);
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  type OrgOpt = {
    value: number;
    label: string;
  };

  const [selectedVal, setSelectedVal] = React.useState<OrgOpt[]>([]);

  React.useEffect(() => {
    if (!open) return;

    if (isEdit && initialInvoice) {
      setSelectedVal(
        realorg.filter((org) => {
          return org.value === initialInvoice.inv_org_id;
        })
      );
      setOrgId(initialInvoice.inv_org_id ?? "");
      setInvTypeId(initialInvoice.inv_type_id ?? "");
      setAudCount(initialInvoice.inv_aud_count ?? "");
      setInvAmount(initialInvoice.inv_amount ?? "");
    } else {
      setSelectedVal([]);
      setOrgId("");
      setInvTypeId("");
      setAudCount("");
      setInvAmount("");
    }
    setError(null);
    setErrors({});
    setLoading(false);
  }, [open, isEdit, initialInvoice, realorg]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const formData: InvoiceFormData = {
      org_id: orgId,
      inv_type_id: invTypeId,
      inv_aud_count: audCount,
      inv_aud_amount: invAmount,
    };

    const validationErrors = validateForm(formData, invoiceSchema);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setError(null);
    setLoading(true);
    try {
      let res: Response;
      console.log("isEdit ", isEdit);
      if (isEdit) {
        const id = initialInvoice?.inv_id;
        if (!id) {
          setError("Засах хэрэглэгч сонгогдоогүй байна.");
          return;
        }

        // ✅ EDIT → PUT /api/invoices_new/:id
        res = await fetchWithAuth(`/api/invoices_new/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inv_id: id,
            inv_org_id: orgId,
            inv_type_id: invTypeId,
            inv_aud_count: audCount,
            inv_aud_amount: invAmount,
          }),
        });
      } else {
        // ✅ CREATE → POST /api/users
        res = await fetchWithAuth("/api/invoices_new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            org_id: orgId,
            inv_type_id: invTypeId,
            inv_aud_count: audCount,
            inv_aud_amount: invAmount,
          }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || "Хадгалахад алдаа гарлаа");
        return;
      }
      toast("success", "Нэхэмжлэх амжилттай үүслээ.");

      onOpenChange(false);
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || "Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }

  const formatOptionLabel = ({ label }: { label: string }) => (
    <div dangerouslySetInnerHTML={{ __html: label }} />
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Нэхэмжлэхийн мэдээлэл засах" : "Шинэ нэхэмжлэх үүсгэх"}
          </h2>

          <button
            className="rounded px-2 py-1 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Нэхэмжлэхийн төрөл:</label>
            <select
              value={invTypeId}
              onChange={(e) => {
                const value = e.target.value;
                setInvTypeId(value === "" ? "" : Number(value));
                clearError("inv_type_id");
              }}
              className={getInputClass("inv_type_id")}
            >
              <option value="">Сонгоно уу</option>
              <option value="2">Онцгой санал</option>
              <option value="3">Урамшуулал</option>
            </select>
            {renderError("inv_type_id")}
          </div>

          <div>
            <label className="mb-1 block text-sm">Байгууллага сонгох:</label>
            <Select
              className="basic-single"
              options={realorg}
              value={selectedVal}
              onChange={(selectedorg: any) => {
                setSelectedVal(selectedorg);
                setOrgId(selectedorg?.value ?? "");
                clearError("org_id");
              }}
              placeholder="нэр эсвэл регистр"
              isSearchable={true}
              isClearable={true}
              formatOptionLabel={formatOptionLabel}
            />
            {renderError("org_id")}
          </div>

          <div>
            <label className="mb-1 block text-sm">Аудитын эрхийн тоо:</label>
            <NumberStepper
              value={audCount}
              onChange={(val) => {
                setAudCount(val);
                clearError("inv_aud_count");
              }}
              min={0}
              error={errors.inv_aud_count}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Нэхэмжлэлийн нийт дүн:</label>
            <input
              className={getInputClass("inv_aud_amount")}
              value={invAmount}
              onChange={(e) => {
                setInvAmount(e.target.value === "" ? "" : Number(e.target.value));
                clearError("inv_aud_amount");
              }}
            />
            {renderError("inv_aud_amount")}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded border px-4 py-2"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Болих
            </button>
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
