"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  fs_id: number;
  fs_aud_id: number;
  fs_form_id: number;
  fs_ind_id: number;
  ind_group_id: number;
  ind_group_label: string;
  ind_label: string;
  ind_code: string;
  fs_val1: string | null;
  fs_val2: string | null;
};

export default function Form202({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form202?aud_id=${auditId}`);
        const result = await res.json();

        setData(Array.isArray(result.data) ? result.data : []);
        console.log(result.data, "result202");
        setFormId(result.form_id ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTableData();
  }, [auditId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const fs_data = data.map((row) => ({}));

      const res = await fetchWithAuth(`/api/audit/form202/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          status_id: 1,
          fs_data,
        }),
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
      {loading ? (
        <div>Уншиж байна...</div>
      ) : (
        <>
          <div className="m-2 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
          <h2>Санхүүгийн байдлын тайлангийн эхний үлдэгдлийн тулгалт</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left w-10">№</th>
                <th className="border p-2 text-left w-1/2">Үзүүлэлт</th>
                <th className="border p-2 text-left">20xx.12.31</th>
                <th className="border p-2 text-left">20xx.01.01</th>
                <th className="border p-2 text-left">Зөрүү дүн</th>
                <th className="border p-2 text-left">Зөрүү хувь</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <h2>Санхүүгийн байдлын тайлангийн харьцуулсан шинжилгээ</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left w-10">№</th>
                <th className="border p-2 text-left w-1/2">Үзүүлэлт</th>
                <th className="border p-2 text-left">20xx.12.31</th>
                <th className="border p-2 text-left">20xx.01.01</th>
                <th className="border p-2 text-left">Зөрүү дүн</th>
                <th className="border p-2 text-left">Зөрүү хувь</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <h2>Орлогын дэлгэрэнгүй тайлангийн харьцуулсан шинжилгээ</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left w-10">№</th>
                <th className="border p-2 text-left w-1/2">Үзүүлэлт</th>
                <th className="border p-2 text-left">20xx.12.31</th>
                <th className="border p-2 text-left">20xx.01.01</th>
                <th className="border p-2 text-left">Зөрүү дүн</th>
                <th className="border p-2 text-left">Зөрүү хувь</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <h2>Өмчийн өөрчлөлтийн тайлангийн харьцуулсан шинжилгээ</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left w-10">№</th>
                <th className="border p-2 text-left w-1/2">Үзүүлэлт</th>
                <th className="border p-2 text-left">20xx.12.31</th>
                <th className="border p-2 text-left">20xx.01.01</th>
                <th className="border p-2 text-left">Зөрүү дүн</th>
                <th className="border p-2 text-left">Зөрүү хувь</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <h2>Мөнгөн гүйлгээний тайлангийн харьцуулсан шинжилгээ</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left w-10">№</th>
                <th className="border p-2 text-left w-1/2">Үзүүлэлт</th>
                <th className="border p-2 text-left">20xx.12.31</th>
                <th className="border p-2 text-left">20xx.01.01</th>
                <th className="border p-2 text-left">Зөрүү дүн</th>
                <th className="border p-2 text-left">Зөрүү хувь</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
