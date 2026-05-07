"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";
import FormActionSection from "../components/FormActionSection";
import { useToast } from "@/context/ToastContext";
import { F207_DATA_MAP2, F304_DATA_MAP1 } from "@/utils/constSelect";
import SkeletonCard from "../components/SkeletonCard";

type Props = {
  auditId: number;
  formListId: number;
};

type TableRow = {
  risk_id: number;
  res_form_id: number;
  risk_type_id: number;
  risk_type_name: string;
  risk_group_id: number;
  risk_group_name: string;
  risk_sub_group_id: number;
  risk_sub_group_name: string;
  risk_cd_type_id: number;
  risk_cd_type_name: string;
  risk_content: string;
  resp_main_type_id: number;
  resp_main_type_name: string;
  resp_rtype_id: number;
  resp_sub_rtype_id: number;
  resp_simple_type: number;
  resp_response: string;
  res_situation: string;
  res_result: string;
  res_fault_level: number;
  risk_is_important: number;
};

export default function Form304({ auditId, formListId }: Props) {
  const [data, setData] = useState<TableRow[]>([]);
  const [formId, setFormId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadTableData() {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`/api/audit/form304?aud_id=${auditId}`);
        const result = await res.json();

        console.log(result, "<====result304");
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

      const resultData = data.map((row) => ({
        risk_id: row.risk_id,
        res_situation: row.res_situation,
        res_result: row.res_result,
        res_fault_level: row.res_fault_level,
      }));

      const res = await fetchWithAuth(`/api/audit/form304/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_id: formId,
          resultData,
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
        <SkeletonCard />
      ) : (
        <>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            A: Санхүүгийн тайлангийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн үнэлгээ
          </h2>

          <table className="w-full border-collapse text-sm mb-2">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="w-[30px] border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  №
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тодорхойлсон эрсдэл
                </th>
                <th className="border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Ерөнхий хариу үйлдэл
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Гүйцэтгэх горим, сорил
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Нөхцөл байдал
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Горим, сорилын үр дүн
                </th>
                <th className="w-1/12 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тухайн үр дүнг алдаа зөрчилд тооцох эсэх
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
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={rw.risk_content ?? ""}
                        className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      {rw.resp_main_type_name}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      {rw.resp_response}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        value={rw.res_situation || ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === rw.risk_id
                                ? {
                                    ...r,
                                    res_situation: e.target.value,
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        value={rw.res_result || ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === rw.risk_id
                                ? {
                                    ...r,
                                    res_result: e.target.value,
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <select
                        value={rw.res_fault_level ?? ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === rw.risk_id
                                ? {
                                    ...r,
                                    res_fault_level:
                                      e.target.value === "" ? 0 : Number(e.target.value),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                      >
                        <option value="">Сонгох</option>
                        {Object.entries(F304_DATA_MAP1).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Б: Батламж мэдэгдлийн түвшний материаллаг буруу илэрхийллийн эрсдэлийн үнэлгээ
          </h2>
          <table className="w-full border-collapse text-sm mb-2">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="w-[30px] border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  №
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тодорхойлсон эрсдэл
                </th>
                <th className="border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  АГАДҮТ-ын дэд анги
                </th>
                <th className="border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center">
                  Холбогдох батламж мэдэгдэл
                </th>
                <th className="border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center">
                  Хяналтын сорил, бие даасан горим
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center">
                  Гүйцэтгэх горим, сорил
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center">
                  Түүврээс шалгасан зүйлийн нөхцөл байдал
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center">
                  Горим, сорилын үр дүн
                </th>
                <th className="w-1/12 border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center">
                  Тухайн үр дүнг алдаа зөрчилд тооцох эсэх
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
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.risk_content ?? ""}
                        className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      {row.risk_group_name}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      {row.risk_sub_group_name}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      {F207_DATA_MAP2[String(row.resp_rtype_id)]?.[String(row.resp_sub_rtype_id)] ??
                        "-"}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      {row.resp_response}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        value={row.res_situation || ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    res_situation: e.target.value,
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        value={row.res_result || ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    res_result: e.target.value,
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <select
                        value={row.res_fault_level ?? ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    res_fault_level:
                                      e.target.value === "" ? 0 : Number(e.target.value),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                      >
                        <option value="">Сонгох</option>
                        {Object.entries(F304_DATA_MAP1).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            В: Ач холбогдолтой биш эрсдэлийн үнэлгээ
          </h2>
          <table className="w-full border-collapse text-sm mb-2">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="w-[30px] border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  №
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Тодорхойлсон эрсдэл
                </th>
                <th className="border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Хамгийн энгийн бие даасан горим
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Гүйцэтгэх горим, сорил
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                  Нөхцөл байдал
                </th>
                <th className="w-1/6 border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center">
                  Горим, сорилын үр дүн
                </th>
                <th className="w-1/12 border border-gray-200 p-2 text-gray-800 dark:border-gray-700 dark:text-gray-100 text-center">
                  Тухайн үр дүнг алдаа зөрчилд тооцох эсэх
                </th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter((row) => row.risk_type_id === 2 && row.risk_is_important === 0)
                .map((row, index) => (
                  <tr key={row.risk_id} className="bg-white dark:bg-gray-900">
                    <td className="border border-gray-200 p-2 text-center text-gray-700 dark:border-gray-700 dark:text-gray-200">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        readOnly
                        value={row.risk_content ?? ""}
                        className="rounded border border-gray-300 w-full field-sizing-content h-full p-1 text-gray-700 dark:border-gray-700 dark:text-gray-200"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      {row.resp_simple_type}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      {row.resp_response}
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        value={row.res_situation || ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    res_situation: e.target.value,
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <textarea
                        value={row.res_result || ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    res_result: e.target.value,
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full field-sizing-content rounded border border-gray-300 bg-white p-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center dark:border-gray-700">
                      <select
                        value={row.res_fault_level ?? ""}
                        onChange={(e) =>
                          setData((prev) =>
                            prev.map((r) =>
                              r.risk_id === row.risk_id
                                ? {
                                    ...r,
                                    res_fault_level:
                                      e.target.value === "" ? 0 : Number(e.target.value),
                                  }
                                : r
                            )
                          )
                        }
                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                      >
                        <option value="">Сонгох</option>
                        {Object.entries(F304_DATA_MAP1).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <FormActionSection formId={formId} formSave={handleSave} />
        </>
      )}
    </>
  );
}
