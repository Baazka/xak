"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
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
};

export default function XakOrgForm({ id, initialData, onSubmit }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<XakOrgFormData>({
    name: initialData?.name ?? "",
    reg_no: initialData?.reg_no ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    address: initialData?.address ?? "",
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(form);
      } else {
        const res = await fetchWithAuth(`/api/xakorg/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!res.ok) throw new Error("Update failed");
      }

      router.push("/xakorg");
    } catch (err) {
      console.error(err);
      alert("Хадгалах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm " +
    "focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 " +
    "dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  return (
    <div className="space-y-6">
      {/* FORM */}
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
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Утас</label>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Хаяг</label>
          <input
            className={inputClass}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Хадгалж байна..." : "Хадгалах"}
        </Button>

       
      </div>
    </div>
  );
}
