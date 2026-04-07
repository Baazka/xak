"use client";

import DatePicker from "@/components/form/datePicker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";

type Props = {
  auditId: number;
};

type CompanyFormData = {
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

export default function FormAuditCompany({ auditId }: Props) {
  const [data, setData] = useState<CompanyFormData>({
    org_regno: "",
    org_legal_name: "",
    org_founded_date: null,
    org_certno: "",
    org_type: "",
    org_main_operation: "",
    org_is_special: false,
    org_shareholder: null,
    org_founder: null,
    org_asset: null,
    org_address: "",
    org_phone: "",
    org_email: "",
    org_head_name: "",
    org_head_phone: "",
    org_head_email: "",
    org_acc_name: "",
    org_acc_phone: "",
    org_acc_email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const onChange = <K extends keyof CompanyFormData>(field: K, value: CompanyFormData[K]) => {
    setData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(`/api/audit/company?aud_id=${auditId}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (res.ok) {
          setData((prev) => ({
            ...prev,
            ...json.data,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [auditId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch(`/api/audit/company/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, aud_id: auditId }),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }

      alert("Амжилттай хадгаллаа");
    } catch (error) {
      console.error(error);
      alert("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Уншиж байна...</div>;

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
              value={data.org_regno ?? ""}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "").slice(0, 7);
                onChange("org_regno", onlyNumbers);
              }}
              className="w-full rounded-lg border px-3 py-2 pr-20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Байгууллагын нэр</label>
          <input
            value={data.org_legal_name}
            onChange={(e) => onChange("org_legal_name", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Байгуулагдсан огноо</label>
          <DatePicker
            id="org_founded_date"
            defaultDate={data.org_founded_date ?? undefined}
            onChange={(dates) => {
              if (dates?.[0]) onChange("org_founded_date", dates[0]);
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Улсын бүртгэлийн дугаар</label>
          <input
            value={data.org_certno}
            onChange={(e) => onChange("org_certno", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Өмчийн хэлбэр</label>
          <input
            value={data.org_type}
            onChange={(e) => onChange("org_type", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Үйл ажиллагааны чиглэл</label>
          <input
            value={data.org_main_operation}
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
                checked={data.org_is_special === true}
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
                checked={data.org_is_special === false}
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
            value={data.org_shareholder ?? 0}
            onChange={(e) => onChange("org_shareholder", parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Эцсийн өмчлөгчийн тоо</label>
          <input
            value={data.org_founder ?? 0}
            onChange={(e) => onChange("org_founder", parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Хувь нийлүүлсэн хөрөнгийн хэмжээ</label>
          <input
            value={data.org_asset ?? 0}
            onChange={(e) => onChange("org_asset", parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* Хаяг */}
        <h2 className="col-span-full text-base font-semibold border-b pb-1 mt-4">
          Хаяг, холбоо барих
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Хаяг</label>
          <input
            value={data.org_address}
            onChange={(e) => onChange("org_address", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Утас</label>
          <input
            value={data.org_phone}
            onChange={(e) => onChange("org_phone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">И-мэйл</label>
          <input
            value={data.org_email}
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
            value={data.org_head_name}
            onChange={(e) => onChange("org_head_name", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Утас</label>
          <input
            value={data.org_head_phone}
            onChange={(e) => onChange("org_head_phone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">И-мэйл</label>
          <input
            value={data.org_head_email}
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
            value={data.org_acc_name}
            onChange={(e) => onChange("org_acc_name", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Утас</label>
          <input
            value={data.org_acc_phone}
            onChange={(e) => onChange("org_acc_phone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">И-мэйл</label>
          <input
            value={data.org_acc_email}
            onChange={(e) => onChange("org_acc_email", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
        >
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </div>
    </>
  );
}
