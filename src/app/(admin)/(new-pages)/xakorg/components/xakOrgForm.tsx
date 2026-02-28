"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type XakOrgFormData = {
  org_register_no: string;
  org_legal_name: string;
  org_phone: string;
  org_email: string;
  org_address: string;
  org_head_name: string;
  org_head_phone: string;
  org_head_email: string;
};

type Props = {
  id?: string;
  initialData?: XakOrgFormData;
  onSubmit?: (data: XakOrgFormData) => Promise<void>;
  loading?: boolean;
};

export default function XakOrgForm({ initialData, onSubmit, loading = false }: Props) {
  const [form, setForm] = useState<XakOrgFormData>({
    org_register_no: initialData?.org_register_no ?? "",
    org_legal_name: initialData?.org_legal_name ?? "",
    org_phone: initialData?.org_phone ?? "",
    org_email: initialData?.org_email ?? "",
    org_address: initialData?.org_address ?? "",
    org_head_name: initialData?.org_head_name ?? "",
    org_head_phone: initialData?.org_head_phone ?? "",
    org_head_email: initialData?.org_head_email ?? "",
  });

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm " +
    "focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 " +
    "dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (loading) return;
        await onSubmit?.(form);
      }}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">ХАК регистрын дугаар</label>
          <input
            className={inputClass}
            value={form.org_register_no}
            onChange={(e) => setForm({ ...form, org_register_no: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Хак нэр</label>
          <input
            className={inputClass}
            value={form.org_legal_name}
            onChange={(e) => setForm({ ...form, org_legal_name: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ХАК утас</label>
          <input
            className={inputClass}
            value={form.org_phone ?? ""}
            onChange={(e) => setForm({ ...form, org_phone: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ХАК мэйл</label>
          <input
            className={inputClass}
            value={form.org_email ?? ""}
            onChange={(e) => setForm({ ...form, org_email: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">ХАК хаяг</label>
          <textarea
            className={inputClass}
            value={form.org_address ?? ""}
            onChange={(e) => setForm({ ...form, org_address: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Удирдлага нэр</label>
          <input
            className={inputClass}
            value={form.org_head_name ?? ""}
            onChange={(e) => setForm({ ...form, org_head_name: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Удирдлага утас</label>
          <input
            className={inputClass}
            value={form.org_head_phone ?? ""}
            onChange={(e) => setForm({ ...form, org_head_phone: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Удирдлага мэйл</label>
          <input
            className={inputClass}
            value={form.org_head_email ?? ""}
            onChange={(e) => setForm({ ...form, org_head_email: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Хадгалж байна..." : "Хадгалах"}
        </Button>
      </div>
    </form>
  );
}
