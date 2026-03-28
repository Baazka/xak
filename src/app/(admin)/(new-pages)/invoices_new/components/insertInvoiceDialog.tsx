"use client";

import * as React from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { InvoiceList } from "../types";
import Select from "react-select";
import { useToast } from "@/context/ToastContext";

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
    setLoading(false);
  }, [open, isEdit, initialInvoice]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

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

  const handleOrgChange = (selectedorg: any) => {
    setSelectedVal(selectedorg);
    setOrgId(selectedorg.value);
  };

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
              onChange={(e) => setInvTypeId(Number(e.target.value))}
              className="w-full rounded-lg border px-3 py-2"
              data-hs-select='{"hasSearch": true}'
            >
              <option value="">Сонгоно уу</option>
              <option value="2">Онцгой санал</option>
              <option value="3">Урамшуулал</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm">Байгууллага сонгох:</label>
            <Select
              className="basic-single"
              options={realorg}
              value={selectedVal}
              onChange={handleOrgChange}
              placeholder="нэр эсвэл регистр"
              isSearchable={true}
              isClearable={true}
              formatOptionLabel={formatOptionLabel}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Аудитын эрхийн тоо:</label>

            <input
              className="w-full rounded border px-3 py-2"
              value={audCount}
              onChange={(e) => setAudCount(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Нэхэмжлэлийн нийт дүн:</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={invAmount}
              onChange={(e) => setInvAmount(Number(e.target.value))}
            />
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
