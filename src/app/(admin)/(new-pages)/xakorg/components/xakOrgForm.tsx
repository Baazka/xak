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
  /** Edit үед ирнэ */
  id?: string;
  /** Edit үед preload хийсэн data */
  initialData?: XakOrgFormData;
  /** Create үед ашиглагдана */
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
      // 🟢 CREATE
      if (onSubmit) {
        await onSubmit(form);
        return;
      }

      // 🟡 EDIT
      const res = await fetchWithAuth(`/api/xakorg/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      router.push("/xakorg");
    } catch (err) {
      console.error(err);
      alert("Хадгалах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm mb-1">Нэр</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Регистр</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.reg_no}
          onChange={(e) => setForm({ ...form, reg_no: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">И-мэйл</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Утас</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Хаяг</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Хадгалж байна..." : "Хадгалах"}
        </Button>

        <Button variant="outline" onClick={() => router.push("/xakorg")} disabled={loading}>
          Буцах
        </Button>
      </div>
    </div>
  );
}
