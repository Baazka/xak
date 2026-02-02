"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type XakOrgFormData = {
  name: string;
  reg_no: string;
  email?: string;
  phone?: string;
  address?: string;
};

type Props = {
  id?: string;
  initialData?: XakOrgFormData;
  onSubmit?: (data: XakOrgFormData) => Promise<void>;
  loading?: boolean;
};

export default function XakOrgForm({ initialData, onSubmit, loading = false }: Props) {
  const [form, setForm] = useState<XakOrgFormData>({
    name: initialData?.name ?? "",
    reg_no: initialData?.reg_no ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    address: initialData?.address ?? "",
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Нэр</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Регистр</label>
          <input
            className={inputClass}
            value={form.reg_no}
            onChange={(e) => setForm({ ...form, reg_no: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">И-мэйл</label>
          <input
            className={inputClass}
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Утас</label>
          <input
            className={inputClass}
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Хаяг</label>
          <input
            className={inputClass}
            value={form.address ?? ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
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
