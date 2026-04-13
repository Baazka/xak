import React, { useState } from "react";
import DatePicker from "../../form/DatePicker";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { on } from "events";
type AuditCompanyFormData = {
  // Ерөнхий мэдээлэл
  org_regno: string;
  org_legal_name: string;
  org_founded_date: Date | null;
  org_certno: string;
  org_type: string;
  org_main_operation: string;
  org_is_special: boolean;
  org_shareholder: number | null;
  org_founder: number | null;
  org_asset: number | null;

  // Хаяг
  org_address: string;
  org_phone: string;
  org_email: string;

  // Гүйцэтгэх захирал
  org_head_name: string;
  org_head_phone: string;
  org_head_email: string;

  // Нягтлан бодогч
  org_acc_name: string;
  org_acc_phone: string;
  org_acc_email: string;
};
type Props = {
  values: AuditCompanyFormData;
  onChange: <K extends keyof AuditCompanyFormData>(
    field: K,
    value: AuditCompanyFormData[K]
  ) => void;
};

export default function AuditCompany({ values, onChange }: Props) {
  const [loading, setLoading] = useState(false);

  const handleGetOpenData = async (org_regno: string) => {
    if (!org_regno || org_regno.length !== 7) return;

    try {
      setLoading(true);

      const res = await fetch("/api/opendatalab?register=" + org_regno);
      const data = await res.json();

      console.log(data);

      // API-с ирсэн утгаар form fill хийх
      onChange("org_legal_name", data?.legal_name ?? "");
      onChange("org_founded_date", data?.founded_date ? new Date(data.founded_date) : null);
      onChange("org_type", data?.legal_form ?? "");
      onChange("org_address", data?.address ?? "");
      onChange("org_main_operation", data?.activity ?? "");
      onChange("org_founder", data?.lastOwner ?? "");
      onChange("org_head_name", data?.manager ?? "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Ерөнхий мэдээлэл */}
        <h2 className="col-span-full text-base font-semibold border-b pb-1">Ерөнхий мэдээлэл</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Регистр</label>

          <div className="relative">
            <input
              inputMode="numeric"
              maxLength={7}
              value={values.org_regno}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "").slice(0, 7);
                onChange("org_regno", onlyNumbers);
              }}
              className="w-full rounded-lg border px-3 py-2 pr-20"
            />

            <button
              type="button"
              disabled={values.org_regno.length !== 7}
              onClick={() => handleGetOpenData(values.org_regno)}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 px-3 py-1 text-white text-sm"
            >
              Шалгах
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Байгууллагын нэр</label>
          <input
            value={values.org_legal_name}
            onChange={(e) => onChange("org_legal_name", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Байгуулагдсан огноо</label>
          <DatePicker
            id="org_founded_date"
            defaultDate={values.org_founded_date ?? undefined}
            onChange={(dates) => {
              if (dates?.[0]) onChange("org_founded_date", dates[0]);
            }}
            size="lg"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Улсын бүртгэлийн дугаар</label>
          <input
            value={values.org_certno}
            onChange={(e) => onChange("org_certno", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Өмчийн хэлбэр</label>
          <input
            value={values.org_type}
            onChange={(e) => onChange("org_type", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Үйл ажиллагааны чиглэл</label>
          <input
            value={values.org_main_operation}
            onChange={(e) => onChange("org_main_operation", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Тусгай зориулалттай компани эсэх</label>

          <div className="flex items-center gap-6">
            {/* Тийм */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="org_is_special"
                checked={values.org_is_special === true}
                onChange={() => onChange("org_is_special", true)}
                className="h-4 w-4"
              />
              Тийм
            </label>

            {/* Үгүй */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="org_is_special"
                checked={values.org_is_special === false}
                onChange={() => onChange("org_is_special", false)}
                className="h-4 w-4"
              />
              Үгүй
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Эзэмшигчийн тоо</label>
          <input
            value={values.org_shareholder ?? 0}
            onChange={(e) => onChange("org_shareholder", parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2 text-right"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Эцсийн өмчлөгчийн тоо</label>
          <input
            value={values.org_founder ?? 0}
            onChange={(e) => onChange("org_founder", parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2 text-right"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Хувь нийлүүлсэн хөрөнгийн хэмжээ</label>
          <input
            value={values.org_asset ?? 0}
            onChange={(e) => onChange("org_asset", parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2 text-right"
          />
        </div>

        {/* Хаяг */}
        <h2 className="col-span-full text-base font-semibold border-b pb-1 mt-4">
          Хаяг, холбоо барих
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Хаяг</label>
          <input
            value={values.org_address}
            onChange={(e) => onChange("org_address", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Утас</label>
          <input
            value={values.org_phone}
            onChange={(e) => onChange("org_phone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">И-мэйл</label>
          <input
            value={values.org_email}
            onChange={(e) => onChange("org_email", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* CEO */}
        <h2 className="col-span-full text-base font-semibold border-b pb-1 mt-4">
          Гүйцэтгэх захирал
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Нэр</label>
          <input
            value={values.org_head_name}
            onChange={(e) => onChange("org_head_name", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Утас</label>
          <input
            value={values.org_head_phone}
            onChange={(e) => onChange("org_head_phone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">И-мэйл</label>
          <input
            value={values.org_head_email}
            onChange={(e) => onChange("org_head_email", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        {/* ACC */}
        <h2 className="col-span-full text-base font-semibold border-b pb-1 mt-4">
          Ерөнхий нягтлан бодогч
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Нэр</label>
          <input
            value={values.org_acc_name}
            onChange={(e) => onChange("org_acc_name", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Утас</label>
          <input
            value={values.org_acc_phone}
            onChange={(e) => onChange("org_acc_phone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">И-мэйл</label>
          <input
            value={values.org_acc_email}
            onChange={(e) => onChange("org_acc_email", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      <LoadingScreen show={loading} />
    </>
  );
}
