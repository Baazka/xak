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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputClass = `
w-full rounded-lg border px-3 py-2 text-sm
focus:outline-none focus:ring-1
dark:bg-gray-900 dark:text-white
`;

  const normalClass = `
border-gray-300 focus:border-brand-500 focus:ring-brand-500
dark:border-gray-700
`;

  const errorClass = `
border-red-500 focus:border-red-500 focus:ring-red-500
`;
  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();

        if (loading) return;

        const newErrors: any = {};

        if (!form.org_register_no.trim()) {
          newErrors.org_register_no = "ХАК регистрын дугаар заавал бөглөх";
        }
        if (!form.org_legal_name.trim()) {
          newErrors.org_legal_name = "ХАК нэр заавал бөглөх";
        }
        if (!form.org_phone.trim()) {
          newErrors.org_phone = "ХАК утас заавал бөглөх";
        }
        if (!form.org_address.trim()) {
          newErrors.org_address = "ХАК хаяг заавал бөглөх";
        }
        if (!form.org_email.trim()) {
          newErrors.org_email = "ХАК мэйл заавал бөглөх";
        }
        if (!form.org_head_name.trim()) {
          newErrors.org_head_name = "Удирдлага нэр заавал бөглөх";
        }
        if (!form.org_head_phone.trim()) {
          newErrors.org_head_phone = "Удирдлага утас заавал бөглөх";
        }
        if (!form.org_head_email.trim()) {
          newErrors.org_head_email = "Удирдлага мэйл заавал бөглөх";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;
        await onSubmit?.(form);
      }}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">ХАК регистрын дугаар</label>
          <input
            className={`${inputClass} ${errors.org_register_no ? errorClass : normalClass}`}
            value={form.org_register_no}
            onChange={(e) => {
              setForm({ ...form, org_register_no: e.target.value });
              setErrors((prev) => ({ ...prev, org_register_no: "" }));
            }}
          />
          {errors.org_register_no && (
            <p className="mt-1 text-xs text-red-500">{errors.org_register_no}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ХАК нэр</label>
          <input
            className={`${inputClass} ${errors.org_legal_name ? errorClass : normalClass}`}
            value={form.org_legal_name}
            onChange={(e) => {
              setForm({ ...form, org_legal_name: e.target.value });
              setErrors((prev) => ({ ...prev, org_legal_name: "" }));
            }}
          />
          {errors.org_legal_name && (
            <p className="mt-1 text-xs text-red-500">{errors.org_legal_name}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ХАК утас</label>
          <input
            className={`${inputClass} ${errors.org_phone ? errorClass : normalClass}`}
            value={form.org_phone ?? ""}
            onChange={(e) => {
              setForm({ ...form, org_phone: e.target.value });
              setErrors((prev) => ({ ...prev, org_phone: "" }));
            }}
          />
          {errors.org_phone && <p className="mt-1 text-xs text-red-500">{errors.org_phone}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ХАК мэйл</label>
          <input
            className={`${inputClass} ${errors.org_email ? errorClass : normalClass}`}
            value={form.org_email ?? ""}
            onChange={(e) => {
              setForm({ ...form, org_email: e.target.value });
              setErrors((prev) => ({ ...prev, org_email: "" }));
            }}
          />
          {errors.org_email && <p className="mt-1 text-xs text-red-500">{errors.org_email}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">ХАК хаяг</label>
          <textarea
            className={`${inputClass} ${errors.org_address ? errorClass : normalClass}`}
            value={form.org_address ?? ""}
            onChange={(e) => {
              setForm({ ...form, org_address: e.target.value });
              setErrors((prev) => ({ ...prev, org_address: "" }));
            }}
          />
          {errors.org_address && <p className="mt-1 text-xs text-red-500">{errors.org_address}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Удирдлага нэр</label>
          <input
            className={`${inputClass} ${errors.org_head_name ? errorClass : normalClass}`}
            value={form.org_head_name ?? ""}
            onChange={(e) => {
              setForm({ ...form, org_head_name: e.target.value });
              setErrors((prev) => ({ ...prev, org_head_name: "" }));
            }}
          />
          {errors.org_head_name && (
            <p className="mt-1 text-xs text-red-500">{errors.org_head_name}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Удирдлага утас</label>
          <input
            className={`${inputClass} ${errors.org_head_phone ? errorClass : normalClass}`}
            value={form.org_head_phone ?? ""}
            onChange={(e) => {
              setForm({ ...form, org_head_phone: e.target.value });
              setErrors((prev) => ({ ...prev, org_head_phone: "" }));
            }}
          />
          {errors.org_head_phone && (
            <p className="mt-1 text-xs text-red-500">{errors.org_head_phone}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Удирдлага мэйл</label>
          <input
            className={`${inputClass} ${errors.org_head_email ? errorClass : normalClass}`}
            value={form.org_head_email ?? ""}
            onChange={(e) => {
              setForm({ ...form, org_head_email: e.target.value });
              setErrors((prev) => ({ ...prev, org_head_email: "" }));
            }}
          />
          {errors.org_head_email && (
            <p className="mt-1 text-xs text-red-500">{errors.org_head_email}</p>
          )}
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
