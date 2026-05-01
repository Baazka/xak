"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Fragment, useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { MessageCircle, Printer } from "lucide-react";
import { useHelpDesk } from "@/context/HelpDeskContext";
import { usePrint } from "@/hooks/usePrint";
import { F205_DATA_MAP1, F205_DATA_MAP2, F205_DATA_MAP3 } from "@/utils/constSelect";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  risk_id: number;
  op_form_id: number;
  risk_type_id: number;
  risk_type_name: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  risk_content: string;
  op_is_fraud: number;
  op_fraud_reason: string;
  op_is_control: number;
  op_genre: number;
  op_inspection_rate: number;
  op_effect_rate: number;
  op_is_material: number;
  op_is_impact: number;
  risk_is_important: number;
};

export default function Form205({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { openHelp } = useHelpDesk();
  const { handlePrint } = usePrint();
  const { toast } = useToast();

  const [supVal, setSupVal] = useState<string>("");

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form205?aud_id=${auditId}`);
        const result = await res.json();

        setData(Array.isArray(result.data) ? result.data : []);
        setFormId(result.form_id ?? 0);
        setSupVal(result.formData.form_sup_value ?? "");
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

      const operationData = data;

      const res = await fetchWithAuth(`/api/audit/form205/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aud_id: auditId,
          form_id: formId,
          form_status_id: 1,
          form_sup_value: supVal,
          operationData,
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
          <div className="flex items-center justify-end gap-2 mb-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-gradient-to-b from-blue-600 to-blue-700 px-5 text-sm font-semibold text-white shadow transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:from-gray-400 disabled:to-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:bg-none dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:bg-gray-700"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent dark:border-gray-300 dark:border-t-transparent" />
              )}
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
            <button
              type="button"
              onClick={() => openHelp({ audId: auditId, formId: formListId })}
              className="inline-flex h-10 items-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              title="Тусламж"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handlePrint("portrait")}
              className="inline-flex h-10 items-center rounded-lg bg-slate-700 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
              title="Хэвлэх"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-2">
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                A: Санхүүгийн тайлангийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн үнэлгээ
              </span>
            </div>
            <div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="w-1/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      №
                    </th>
                    <th className="w-2/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Тодорхойлсон эрсдэл
                    </th>
                    <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Залилангийн эрсдэл гарах магадлалтай эсэх
                    </th>
                    <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Залилангийн эрсдэл гарах шалтгаан
                    </th>
                    <th className="w-1/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Дотоод хяналтын тогтолцооны бүрэлдэхүүн хэсгээс үүссэн дутагдал эсэх
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter((row) => row.risk_type_id === 1)
                    .map((rw, index) => (
                      <tr key={rw.risk_id} className="bg-white dark:bg-gray-900">
                        <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          {index + 1}
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200 flex items-center justify-center">
                          <textarea
                            readOnly
                            value={rw.risk_content ?? ""}
                            className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                          <div className="flex items-center justify-center gap-4 text-gray-700 dark:text-gray-200">
                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`fraud-${rw.risk_id}`}
                                checked={rw.op_is_fraud === 1}
                                onChange={() =>
                                  setData((prev) =>
                                    prev.map((r) =>
                                      r.risk_id === rw.risk_id ? { ...r, op_is_fraud: 1 } : r
                                    )
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Тийм
                            </label>

                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`fraud-${rw.risk_id}`}
                                checked={rw.op_is_fraud === 0}
                                onChange={() =>
                                  setData((prev) =>
                                    prev.map((r) =>
                                      r.risk_id === rw.risk_id ? { ...r, op_is_fraud: 0 } : r
                                    )
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Үгүй
                            </label>
                          </div>
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200 flex items-center justify-center">
                          <textarea
                            value={rw.op_fraud_reason || ""}
                            onChange={(e) =>
                              setData((prev) =>
                                prev.map((r) =>
                                  r.risk_id === rw.risk_id
                                    ? { ...r, op_fraud_reason: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="rounded border border-gray-300 w-full field-sizing-content p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                          <div className="flex items-center justify-center gap-4 text-gray-700 dark:text-gray-200">
                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`control-${rw.risk_id}`}
                                checked={rw.op_is_control === 1}
                                onChange={() =>
                                  setData((prev) =>
                                    prev.map((r) =>
                                      r.risk_id === rw.risk_id ? { ...r, op_is_control: 1 } : r
                                    )
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Тийм
                            </label>

                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`control-${rw.risk_id}`}
                                checked={rw.op_is_control === 0}
                                onChange={() =>
                                  setData((prev) =>
                                    prev.map((r) =>
                                      r.risk_id === rw.risk_id ? { ...r, op_is_control: 0 } : r
                                    )
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Үгүй
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-2">
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Б: Батламж мэдэгдлийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн үнэлгээ
              </span>
            </div>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th
                    rowSpan={2}
                    className="w-1/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    №
                  </th>
                  <th
                    rowSpan={2}
                    className="w-2/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    Тодорхойлсон эрсдэл
                  </th>
                  <th
                    rowSpan={2}
                    className="w-1/10 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    Уламжлалт эсвэл Хяналтын эрсдэл эсэх
                  </th>
                  <th
                    colSpan={3}
                    className="border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center"
                  >
                    Эрсдэлийн үнэлгээ
                  </th>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Тохиолдох магадлал
                  </th>
                  <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Санхүүгийн тайланд үзүүлэх нөлөө
                  </th>
                  <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                    Дундаж үнэлгээ
                  </th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((row) => row.risk_type_id === 2 && row.risk_is_important === 1)
                  .map((row, index) => (
                    <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                      <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        {index + 1}
                      </td>
                      <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200 flex items-center justify-center">
                        <textarea
                          readOnly
                          value={row.risk_content ?? ""}
                          className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                        />
                      </td>
                      <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        <select
                          value={row.op_genre ?? 0}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.risk_id === row.risk_id
                                  ? { ...r, op_genre: Number(e.target.value) }
                                  : r
                              )
                            )
                          }
                          className="flex rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                          <option value={0}>Сонгох</option>
                          {Object.entries(F205_DATA_MAP1).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        <select
                          value={row.op_inspection_rate ?? 0}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.risk_id === row.risk_id
                                  ? { ...r, op_inspection_rate: Number(e.target.value) }
                                  : r
                              )
                            )
                          }
                          className="rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                          <option value={0}>Сонгох</option>
                          {Object.entries(F205_DATA_MAP2).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        <select
                          value={row.op_effect_rate ?? 0}
                          onChange={(e) =>
                            setData((prev) =>
                              prev.map((r) =>
                                r.risk_id === row.risk_id
                                  ? { ...r, op_effect_rate: Number(e.target.value) }
                                  : r
                              )
                            )
                          }
                          className="rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                          <option value={0}>Сонгох</option>
                          {Object.entries(F205_DATA_MAP2).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                        <span className="text-gray-700 dark:text-gray-200">
                          {Number(row.op_inspection_rate) > 0 && Number(row.op_effect_rate) > 0
                            ? (
                                (Number(row.op_inspection_rate) + Number(row.op_effect_rate)) /
                                2
                              ).toFixed(2)
                            : "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      Уламжлалт эрсдэлийн ерөнхий үнэлгээ
                    </span>
                  </td>
                  <td
                    colSpan={2}
                    className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">
                      {(
                        data
                          .filter(
                            (row) =>
                              row.op_genre === 1 &&
                              row.risk_type_id === 2 &&
                              row.risk_is_important === 1
                          )
                          .reduce(
                            (acc, row) =>
                              acc +
                              (Number(row.op_effect_rate) + Number(row.op_inspection_rate)) / 2,
                            0
                          ) /
                        data.filter(
                          (row) =>
                            row.op_genre === 1 &&
                            row.risk_type_id === 2 &&
                            row.risk_is_important === 1
                        ).length
                      ).toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      Хяналтын эрсдэлийн ерөнхий үнэлгээ
                    </span>
                  </td>
                  <td
                    colSpan={2}
                    className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">
                      {(
                        data
                          .filter(
                            (row) =>
                              row.op_genre === 2 &&
                              row.risk_type_id === 2 &&
                              row.risk_is_important === 1
                          )
                          .reduce(
                            (acc, row) =>
                              acc +
                              (Number(row.op_effect_rate) + Number(row.op_inspection_rate)) / 2,
                            0
                          ) /
                        data.filter(
                          (row) =>
                            row.op_genre === 2 &&
                            row.risk_type_id === 2 &&
                            row.risk_is_important === 1
                        ).length
                      ).toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">
                      Материаллаг буруу илэрхийллийн эрсдэлийн үнэлгээ
                    </span>
                  </td>
                  <td
                    colSpan={2}
                    className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">
                      {(
                        (data
                          .filter(
                            (row) =>
                              row.op_genre === 1 &&
                              row.risk_type_id === 2 &&
                              row.risk_is_important === 1
                          )
                          .reduce(
                            (acc, row) =>
                              acc +
                              (Number(row.op_effect_rate) + Number(row.op_inspection_rate)) / 2,
                            0
                          ) /
                          data.filter(
                            (row) =>
                              row.op_genre === 1 &&
                              row.risk_type_id === 2 &&
                              row.risk_is_important === 1
                          ).length) *
                        (data
                          .filter(
                            (row) =>
                              row.op_genre === 2 &&
                              row.risk_type_id === 2 &&
                              row.risk_is_important === 1
                          )
                          .reduce(
                            (acc, row) =>
                              acc +
                              (Number(row.op_effect_rate) + Number(row.op_inspection_rate)) / 2,
                            0
                          ) /
                          data.filter(
                            (row) =>
                              row.op_genre === 2 &&
                              row.risk_type_id === 2 &&
                              row.risk_is_important === 1
                          ).length)
                      ).toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      Аудитын баталгааны түвшин болон эрсдэлийн хэмжээ
                    </span>
                  </td>
                  <td className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <select
                      value={supVal || ""}
                      onChange={(e) => setSupVal(e.target.value)}
                      className="rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="">Сонгох</option>
                      {Object.entries(F205_DATA_MAP3).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">
                      {supVal === "" ? (0).toFixed(2) : ((100 - Number(supVal)) / 100).toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr className="bg-white dark:bg-gray-900">
                  <td
                    colSpan={3}
                    className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      Илрүүлэлтийн эрсдэлийн хэмжээ
                    </span>
                  </td>
                  <td
                    colSpan={2}
                    className="border border-gray-200 bg-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200"
                  ></td>
                  <td className="border border-gray-200 p-0.5 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200 bg-green-100">
                    <span className="text-gray-700 dark:text-gray-200 font-bold">
                      {supVal === ""
                        ? (0).toFixed(2)
                        : (
                            (100 - Number(supVal)) /
                            100 /
                            ((data
                              .filter(
                                (row) =>
                                  row.op_genre === 1 &&
                                  row.risk_type_id === 2 &&
                                  row.risk_is_important === 1
                              )
                              .reduce(
                                (acc, row) =>
                                  acc +
                                  (Number(row.op_effect_rate) + Number(row.op_inspection_rate)) / 2,
                                0
                              ) /
                              data.filter(
                                (row) =>
                                  row.op_genre === 1 &&
                                  row.risk_type_id === 2 &&
                                  row.risk_is_important === 1
                              ).length) *
                              (data
                                .filter(
                                  (row) =>
                                    row.op_genre === 2 &&
                                    row.risk_type_id === 2 &&
                                    row.risk_is_important === 1
                                )
                                .reduce(
                                  (acc, row) =>
                                    acc +
                                    (Number(row.op_effect_rate) + Number(row.op_inspection_rate)) /
                                      2,
                                  0
                                ) /
                                data.filter(
                                  (row) =>
                                    row.op_genre === 2 &&
                                    row.risk_type_id === 2 &&
                                    row.risk_is_important === 1
                                ).length))
                          ).toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                В: Ач холбогдолтой биш эрсдэлийн үнэлгээ
              </span>
            </div>
            <div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="w-1/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      №
                    </th>
                    <th className="w-2/5 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Тодорхойлсон эрсдэл
                    </th>
                    <th className="w-1/4 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Ажил гүйлгээний анги, дансны үлдэгдэл, тодруулгын дэд анги
                    </th>
                    <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Шинж чанарын хувьд материаллаг эсэх
                    </th>
                    <th className="w-3/20 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      Материаллаг буруу илэрхийллийн эрсдэлд нөлөөлөх эсэх
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter((row) => row.risk_type_id === 2 && row.risk_is_important === 0)
                    .map((rwb, index) => (
                      <tr key={rwb.risk_id} className="bg-white dark:bg-gray-900">
                        <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          {index + 1}
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200 h-full">
                          <textarea
                            readOnly
                            value={rwb.risk_content ?? ""}
                            className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                          />
                        </td>
                        <td className="border border-gray-200 p-0.5 text-left text-gray-700 dark:border-gray-700 dark:text-gray-200">
                          <span>
                            {rwb.risk_group_name} - {rwb.risk_sub_group_name}
                          </span>
                        </td>

                        <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                          <div className="flex items-center justify-center gap-4 text-gray-700 dark:text-gray-200">
                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`material-${rwb.risk_id}`}
                                checked={rwb.op_is_material === 1}
                                onChange={() =>
                                  setData((prev) =>
                                    prev.map((r) =>
                                      r.risk_id === rwb.risk_id ? { ...r, op_is_material: 1 } : r
                                    )
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Тийм
                            </label>

                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`material-${rwb.risk_id}`}
                                checked={rwb.op_is_material === 0}
                                onChange={() =>
                                  setData((prev) =>
                                    prev.map((r) =>
                                      r.risk_id === rwb.risk_id ? { ...r, op_is_material: 0 } : r
                                    )
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Үгүй
                            </label>
                          </div>
                        </td>

                        <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                          <div className="flex items-center justify-center gap-4 text-gray-700 dark:text-gray-200">
                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`impact-${rwb.risk_id}`}
                                checked={rwb.op_is_impact === 1}
                                onChange={() =>
                                  setData((prev) =>
                                    prev.map((r) =>
                                      r.risk_id === rwb.risk_id ? { ...r, op_is_impact: 1 } : r
                                    )
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Тийм
                            </label>

                            <label className="flex cursor-pointer items-center gap-1">
                              <input
                                type="radio"
                                name={`impact-${rwb.risk_id}`}
                                checked={rwb.op_is_impact === 0}
                                onChange={() =>
                                  setData((prev) =>
                                    prev.map((r) =>
                                      r.risk_id === rwb.risk_id ? { ...r, op_is_impact: 0 } : r
                                    )
                                  )
                                }
                                className="accent-blue-600 dark:accent-blue-400"
                              />
                              Үгүй
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <FormActionSection auditId={auditId} formId={formListId} />
        </>
      )}
    </>
  );
}
