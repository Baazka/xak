"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  str_id: number;
  str_form_id: number;
  str_ind_id: number;
  str_ind_value: string | null;
  str_ind_label: string;
};

export default function Form401({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form401?aud_id=${auditId}`);
        const result = await res.json();

        console.log(result, "<====result401");
        setData(Array.isArray(result.data) ? result.data : []);
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

      const strData = data.map((row) => ({
        str_id: row.str_id,
        str_ind_id: row.str_ind_id,
        str_ind_value: row.str_ind_value,
      }));

      const res = await fetchWithAuth(`/api/audit/form401/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          status_id: 1,
          strData,
        }),
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

  return (
    <>
      {loading ? (
        <div className="text-gray-700 dark:text-gray-300">Уншиж байна...</div>
      ) : (
        <>
          <div className="m-2 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:border-gray-700 dark:disabled:from-gray-700 dark:disabled:to-gray-700"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>

          <div className="p-4 text-sm text-gray-900">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3">
                  <label className="w-48 text-right leading-5">
                    Тогтоосон материаллаг
                    <br />
                    байдал:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="637,946,494.07"
                    className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-48 text-right leading-5">
                    Гүйцэтгэлийн материаллаг
                    <br />
                    байдал:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="446,562,545.85"
                    className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-48 text-right leading-5">
                    Шинж чанарын хувьд
                    <br />
                    материаллаг:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="0.00"
                    className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-48 text-right">Материаллаг:</label>
                  <input
                    type="text"
                    readOnly
                    value="2,147,188,503.00"
                    className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="w-48 text-right">Материаллаг бус:</label>
                  <input
                    type="text"
                    readOnly
                    value="27,598,573,897.42"
                    className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-gray-500 pt-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Санхүүгийн тайлангийн аудитын асуудал
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <label className="w-48 text-right">Нийт алдааны дүн:</label>
                    <input
                      type="text"
                      readOnly
                      value="296,515,396.96"
                      className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-56 text-right">Залруулсан алдааны дүн:</label>
                    <input
                      type="text"
                      readOnly
                      value="296,515,396.96"
                      className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-56 text-right">Залруулаагүй алдааны дүн:</label>
                    <input
                      type="text"
                      readOnly
                      value="0.00"
                      className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-48 text-right">Нийт зөрчлийн дүн:</label>
                    <input
                      type="text"
                      readOnly
                      value="25,943,312,867.46"
                      className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-500 pt-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Санхүүгийн тайлангийн аудитаар шалгасан нийцлийн аудитын асуудал
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <label className="w-52 text-right leading-5">
                      Шилэн дансны хуулийн хэрэгжилт:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="1,358,745,633.00"
                      className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-48 text-right">Бусад хууль тогтоомж:</label>
                    <input
                      type="text"
                      readOnly
                      value="2,147,188,503.00"
                      className="h-9 w-52 rounded border border-gray-400 bg-white px-3 text-right outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Аудитын дүгнэлт</h2>

                <div className="flex flex-wrap items-center gap-3">
                  <select className="h-9 rounded border border-gray-400 bg-white px-3 outline-none">
                    <option>Өөрчлөлттэй</option>
                  </select>

                  <select className="h-9 rounded border border-gray-400 bg-white px-3 outline-none">
                    <option>Хязгаарлалттай</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
