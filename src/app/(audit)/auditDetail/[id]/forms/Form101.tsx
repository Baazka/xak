"use client";

import DatePicker from "@/components/form/date-picker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import FormActionSection from "../components/FormActionSection";

type Props = {
  auditId: number;
  formListId: number;
};

type CompanyFormData = {
  // Ерөнхий мэдээлэл
  info_reg_no: string;
  info_legal_name: string;
  info_founded_date: Date | null;
  info_certno: string;
  info_type: string;
  info_main_operation: string;
  info_is_special: boolean;
  info_shareholder: number | null;
  info_founder: number | null;
  info_asset: number | null;

  // Хаяг
  info_address: string;
  info_phone: string;
  info_email: string;

  // Гүйцэтгэх захирал
  info_head_name: string;
  info_head_phone: string;
  info_head_email: string;

  // Нягтлан бодогч
  info_acc_name: string;
  info_acc_phone: string;
  info_acc_email: string;
};

export default function Form101({ auditId, formListId }: Props) {
  const [data, setData] = useState<CompanyFormData>({
    info_reg_no: "",
    info_legal_name: "",
    info_founded_date: null,
    info_certno: "",
    info_type: "",
    info_main_operation: "",
    info_is_special: false,
    info_shareholder: null,
    info_founder: null,
    info_asset: null,
    info_address: "",
    info_phone: "",
    info_email: "",
    info_head_name: "",
    info_head_phone: "",
    info_head_email: "",
    info_acc_name: "",
    info_acc_phone: "",
    info_acc_email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formId, setFormId] = useState(0);
  const { toast } = useToast();

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
        const res = await fetchWithAuth(`/api/audit/form101?aud_id=${auditId}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (res.ok) {
          const raw = json.data ?? {};

          setData((prev) => ({
            ...prev,
            info_reg_no: raw.info_reg_no ?? "",
            info_legal_name: raw.info_legal_name ?? "",
            info_founded_date: raw.info_founded_date ?? null,
            info_certno: raw.info_certno ?? "",
            info_type: raw.info_type ?? "",
            info_main_operation: raw.info_main_operation ?? "",
            info_is_special: raw.info_is_special ?? false,
            info_shareholder: raw.info_shareholder ?? null,
            info_founder: raw.info_founder ?? null,
            info_asset: raw.info_asset ?? null,
            info_address: raw.info_address ?? "",
            info_phone: raw.info_phone ?? "",
            info_email: raw.info_email ?? "",
            info_head_name: raw.info_head_name ?? "",
            info_head_phone: raw.info_head_phone ?? "",
            info_head_email: raw.info_head_email ?? "",
            info_acc_name: raw.info_acc_name ?? "",
            info_acc_phone: raw.info_acc_phone ?? "",
            info_acc_email: raw.info_acc_email ?? "",
          }));

          setFormId(json.form_id ?? 0);
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

      console.log("object ", auditId, formId);

      const res = await fetch(`/api/audit/form101/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, aud_id: auditId, form_id: formId, form_status_id: 1 }),
      });

      if (!res.ok) {
        throw new Error("Хадгалахад алдаа гарлаа");
      }

      toast("success", "Амжилттай хадгаллаа");
    } catch (error) {
      console.error(error);
      toast("error", "Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Уншиж байна...</div>;

  return (
    <>
      <div className="mb-4">
        <h2 className="col-span-full text-base font-semibold border-b pb-1">Ерөнхий мэдээлэл</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Ерөнхий мэдээлэл */}

        <div className="space-y-2">
          <label className="block text-sm font-medium">Регистр</label>

          <input
            inputMode="numeric"
            maxLength={7}
            value={data.info_reg_no ?? ""}
            onChange={(e) => {
              const onlyNumbers = e.target.value.replace(/\D/g, "").slice(0, 7);
              onChange("info_reg_no", onlyNumbers);
            }}
            className="w-full rounded-lg border px-3 py-2 pr-20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Байгууллагын нэр</label>
          <input
            value={data?.info_legal_name ?? ""}
            onChange={(e) => onChange("info_legal_name", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Байгуулагдсан огноо</label>
          <DatePicker
            id="org_founded_date"
            defaultDate={data.info_founded_date ?? undefined}
            onChange={(dates) => {
              if (dates?.[0]) onChange("info_founded_date", dates[0]);
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Улсын бүртгэлийн дугаар</label>
          <input
            value={data.info_certno}
            onChange={(e) => onChange("info_certno", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Өмчийн хэлбэр</label>
          <input
            value={data.info_type}
            onChange={(e) => onChange("info_type", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Үйл ажиллагааны чиглэл</label>
          <input
            value={data.info_main_operation}
            onChange={(e) => onChange("info_main_operation", e.target.value)}
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
                name="info_is_special"
                checked={data.info_is_special === true}
                onChange={() => onChange("info_is_special", true)}
                className="h-4 w-4"
              />
              Тийм
            </label>

            {/* Үгүй */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="info_is_special"
                checked={data.info_is_special === false}
                onChange={() => onChange("info_is_special", false)}
                className="h-4 w-4"
              />
              Үгүй
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Эзэмшигчийн тоо</label>
          <input
            value={data.info_shareholder ?? 0}
            onChange={(e) => onChange("info_shareholder", parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Эцсийн өмчлөгчийн тоо</label>
          <input
            value={data.info_founder ?? 0}
            onChange={(e) => onChange("info_founder", parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Хувь нийлүүлсэн хөрөнгийн хэмжээ</label>
          <input
            value={data.info_asset ?? 0}
            onChange={(e) => onChange("info_asset", parseInt(e.target.value))}
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
            value={data.info_address}
            onChange={(e) => onChange("info_address", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Утас</label>
          <input
            value={data.info_phone}
            onChange={(e) => onChange("info_phone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">И-мэйл</label>
          <input
            value={data.info_email}
            onChange={(e) => onChange("info_email", e.target.value)}
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
            value={data.info_head_name}
            onChange={(e) => onChange("info_head_name", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Утас</label>
          <input
            value={data.info_head_phone}
            onChange={(e) => onChange("info_head_phone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">И-мэйл</label>
          <input
            value={data.info_head_email}
            onChange={(e) => onChange("info_head_email", e.target.value)}
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
            value={data.info_acc_name}
            onChange={(e) => onChange("info_acc_name", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Утас</label>
          <input
            value={data.info_acc_phone}
            onChange={(e) => onChange("info_acc_phone", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">И-мэйл</label>
          <input
            value={data.info_acc_email}
            onChange={(e) => onChange("info_acc_email", e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      <FormActionSection
        auditId={auditId}
        formId={formId}
        formListId={formListId}
        formSave={handleSave}
      />
    </>
  );
}
