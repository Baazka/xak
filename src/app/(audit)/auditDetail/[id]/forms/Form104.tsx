"use client";

import DatePicker from "@/components/form/datePicker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";
import { json } from "stream/consumers";

type Props = {
  auditId: number;
};

type BagOption = {
  team_id: number;
  user_firstname: string;
};

type TableRow = {
  id: number;
  title: string;
  answer: "Тийм" | "Үгүй" | null;
};

export default function Form104({ auditId }: Props) {
  const [bags, setBags] = useState<BagOption[]>([]);
  const [selectedBag, setSelectedBag] = useState("");

  const [data, setData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const onChange = <K extends keyof TableRow>(field: K, value: TableRow[K]) => {
    setData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  useEffect(() => {
    async function loadBags() {
      const res = await fetch("/api/audit/form104/meta?aud_id=" + auditId);
      const data = await res.json();

      console.log(data, "data");
      setBags(data.data);

      // default эхний утга
      if (data.length > 0) {
        setSelectedBag(data[0].id);
      }
    }

    loadBags();
  }, [auditId]);

  useEffect(() => {
    if (!selectedBag) return;

    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetch(`/api/audit/form104?aud_id=${auditId}&team_id=${selectedBag}`);
        const data = await res.json();

        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTableData();
  }, [selectedBag]);

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

  return (
    <>
      <div className="mb-4">
        <label className="mr-2">Баг:</label>
        <select
          value={selectedBag}
          onChange={(e) => setSelectedBag(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">Сонгох</option>
          {bags.map((bag) => (
            <option key={bag.team_id} value={bag.team_id}>
              {bag.user_firstname}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Уншиж байна...</div>
      ) : (
        <>
          {JSON.stringify(data)}
          {/* <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2 text-left">Мэдэгдэл</th>
                <th className="border p-2 text-left">Батламж</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2">{row.title}</td>
                  <td className="border p-2">{row.answer ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table> */}
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
      )}
    </>
  );
}
