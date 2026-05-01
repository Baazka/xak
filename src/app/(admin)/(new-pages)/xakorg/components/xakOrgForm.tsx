"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormErrors, validateForm, ValidationSchema } from "@/utils/validation";

export type XakOrgFormData = {
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
  initialData?: Partial<XakOrgFormData>;
  onSubmit?: (data: XakOrgFormData) => Promise<void>;
  loading?: boolean;
};

const emptyForm: XakOrgFormData = {
  org_register_no: "",
  org_legal_name: "",
  org_phone: "",
  org_email: "",
  org_address: "",
  org_head_name: "",
  org_head_phone: "",
  org_head_email: "",
};

const validationSchema: ValidationSchema<XakOrgFormData> = {
  org_register_no: {
    required: true,
    label: "ХАК регистрын дугаар",
  },
  org_legal_name: {
    required: true,
    label: "Хуулийн этгээдийн нэр",
  },
  org_phone: {
    required: true,
    label: "Утас",
    pattern: /^[0-9]{8}$/,
    message: "Утасны дугаар 8 оронтой байх ёстой",
  },
  org_email: {
    required: true,
    label: "Имэйл",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Имэйл хаяг буруу байна",
  },
  org_address: {
    required: true,
    label: "Хаяг",
  },
  org_head_name: {
    required: true,
    label: "Удирдлагын нэр",
  },
  org_head_phone: {
    required: true,
    label: "Удирдлагын утас",
    pattern: /^[0-9]{8}$/,
    message: "Утасны дугаар 8 оронтой байх ёстой",
  },
  org_head_email: {
    required: true,
    label: "Удирдлагын имэйл",
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Имэйл хаяг буруу байна",
  },
};

export default function XakOrgForm({ initialData, onSubmit, loading = false }: Props) {
  const [form, setForm] = useState<XakOrgFormData>({
    ...emptyForm,
    ...initialData,
  });

  const [errors, setErrors] = useState<FormErrors<XakOrgFormData>>({});

  const inputClass =
    "w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-1 dark:bg-gray-900 dark:text-white";

  const normalClass =
    "border-gray-300 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700";

  const errorClass = "border-red-500 focus:border-red-500 focus:ring-red-500";

  const getInputClass = (field: keyof XakOrgFormData) =>
    `${inputClass} ${errors[field] ? errorClass : normalClass}`;

  const handleChange = (field: keyof XakOrgFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const renderError = (field: keyof XakOrgFormData) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const validationErrors = validateForm(form, validationSchema);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];

      document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    await onSubmit?.(form);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">ХАК регистрын дугаар</label>
          <input
            name="org_register_no"
            value={form.org_register_no}
            onChange={(e) => handleChange("org_register_no", e.target.value)}
            className={getInputClass("org_register_no")}
          />
          {renderError("org_register_no")}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ХАК нэр</label>
          <input
            name="org_legal_name"
            value={form.org_legal_name}
            onChange={(e) => handleChange("org_legal_name", e.target.value)}
            className={getInputClass("org_legal_name")}
          />
          {renderError("org_legal_name")}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ХАК утас</label>
          <input
            name="org_phone"
            value={form.org_phone}
            onChange={(e) => handleChange("org_phone", e.target.value)}
            className={getInputClass("org_phone")}
          />
          {renderError("org_phone")}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ХАК мэйл</label>
          <input
            name="org_email"
            value={form.org_email}
            onChange={(e) => handleChange("org_email", e.target.value)}
            className={getInputClass("org_email")}
          />
          {renderError("org_email")}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">ХАК хаяг</label>
          <textarea
            name="org_address"
            value={form.org_address}
            onChange={(e) => handleChange("org_address", e.target.value)}
            className={`${getInputClass("org_address")} min-h-24`}
          />
          {renderError("org_address")}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Удирдлага нэр</label>
          <input
            name="org_head_name"
            value={form.org_head_name}
            onChange={(e) => handleChange("org_head_name", e.target.value)}
            className={getInputClass("org_head_name")}
          />
          {renderError("org_head_name")}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Удирдлага утас</label>
          <input
            name="org_head_phone"
            value={form.org_head_phone}
            onChange={(e) => handleChange("org_head_phone", e.target.value)}
            className={getInputClass("org_head_phone")}
          />
          {renderError("org_head_phone")}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Удирдлага мэйл</label>
          <input
            name="org_head_email"
            value={form.org_head_email}
            onChange={(e) => handleChange("org_head_email", e.target.value)}
            className={getInputClass("org_head_email")}
          />
          {renderError("org_head_email")}
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
