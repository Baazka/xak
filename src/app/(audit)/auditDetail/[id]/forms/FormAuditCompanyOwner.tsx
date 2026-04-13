import DatePicker from "@/components/form/DatePicker";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useEffect, useState } from "react";

type Props = {
  auditId: number;
};

type OperationRow = {
  op_id: number;
  op_aud_id: number;
  op_code: string;
  op_name: string;
  op_date: string;
};

type DetailRow = {
  det_id: number;
  det_aud_id: number;
  det_type_id: number;
  det_category: string;
  det_country: string;
  det_lastname: string;
  det_firstname: string;
  det_date: string;
};
export default function FormAuditCompanyOwner({ auditId }: Props) {
  const [orgData, setOrgData] = useState<any>({});
  const [detailRows, setDetailRows] = useState<Record<number, DetailRow[]>>({
    1: [
      {
        det_id: 0,
        det_aud_id: 0,
        det_type_id: 1,
        det_category: "",
        det_country: "",
        det_lastname: "",
        det_firstname: "",
        det_date: "",
      },
    ],
    2: [
      {
        det_id: 0,
        det_aud_id: 0,
        det_type_id: 2,
        det_category: "",
        det_country: "",
        det_lastname: "",
        det_firstname: "",
        det_date: "",
      },
    ],
    3: [
      {
        det_id: 0,
        det_aud_id: 0,
        det_type_id: 3,
        det_category: "",
        det_country: "",
        det_lastname: "",
        det_firstname: "",
        det_date: "",
      },
    ],
  });

  const [opRows, setOpRows] = useState<OperationRow[]>([
    {
      op_id: 0,
      op_aud_id: 0,
      op_code: "",
      op_name: "",
      op_date: "",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const addRow = (typeId: number) => {
    setDetailRows((prev) => ({
      ...prev,
      [typeId]: [
        ...prev[typeId],
        {
          det_id: 0,
          det_aud_id: 0,
          det_type_id: typeId,
          det_category: "",
          det_country: "",
          det_lastname: "",
          det_firstname: "",
          det_date: "",
        },
      ],
    }));
  };
  const removeRow = async (typeId: number, index: number) => {
    const row = detailRows[typeId][index];

    // 1. confirm
    if (!confirm("Энэ мөрийг устгах уу?")) return;

    try {
      // 2. API delete (DB-д байгаа үед)
      if (row.det_id && row.det_id !== 0) {
        const res = await fetchWithAuth(`/api/audit/company/detail/`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ det_id: row.det_id }),
        });

        // 3. response check
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || "Устгахад алдаа гарлаа");
        }
      }

      // 4. UI update (optimistic)
      setDetailRows((prev) => ({
        ...prev,
        [typeId]: prev[typeId].filter((_, i) => i !== index),
      }));
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Устгахад алдаа гарлаа");
    }
  };

  const updateRow = (typeId: number, index: number, field: keyof DetailRow, value: string) => {
    setDetailRows((prev) => ({
      ...prev,
      [typeId]: prev[typeId].map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  };

  const addOPRow = () => {
    setOpRows((prev) => [
      ...prev,
      {
        op_id: 0,
        op_aud_id: 0,
        op_code: "",
        op_name: "",
        op_date: "",
      },
    ]);
  };

  const removeOPRow = async (index: number) => {
    const row = opRows[index];

    // 1. confirm
    if (!confirm("Энэ мөрийг устгах уу?")) return;

    try {
      if (row.op_id && row.op_id !== 0) {
        const res = await fetchWithAuth(`/api/audit/company/operation/`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ op_id: row.op_id }),
        });

        // 2. response check
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || "Устгахад алдаа гарлаа");
        }
      }

      // 3. UI update
      setOpRows((prev) => prev.filter((_, i) => i !== index));
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Устгахад алдаа гарлаа");
    }
  };

  const updateOPRow = (index: number, field: string, value: string) => {
    setOpRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);

        const [orgRes, detailRes, opRes] = await Promise.all([
          fetchWithAuth(`/api/audit/company?aud_id=${auditId}`, {
            cache: "no-store",
          }),
          fetchWithAuth(`/api/audit/company/detail?aud_id=${auditId}`, {
            cache: "no-store",
          }),
          fetchWithAuth(`/api/audit/company/operation?aud_id=${auditId}`, {
            cache: "no-store",
          }),
        ]);

        const orgJson = await orgRes.json();
        const detailJson = await detailRes.json();
        const opJson = await opRes.json();

        if (orgRes.ok && orgJson.data) {
          setOrgData(orgJson.data);
        }

        if (detailRes.ok && Array.isArray(detailJson.data)) {
          const grouped: Record<number, DetailRow[]> = {
            1: [],
            2: [],
            3: [],
          };

          detailJson.data.forEach((row: DetailRow) => {
            if (!grouped[row.det_type_id]) {
              grouped[row.det_type_id] = [];
            }
            grouped[row.det_type_id].push(row);
          });

          setDetailRows({
            1:
              grouped[1].length > 0
                ? grouped[1]
                : [
                    {
                      det_id: 0,
                      det_aud_id: 0,
                      det_type_id: 1,
                      det_category: "",
                      det_country: "",
                      det_lastname: "",
                      det_firstname: "",
                      det_date: "",
                    },
                  ],
            2:
              grouped[2].length > 0
                ? grouped[2]
                : [
                    {
                      det_id: 0,
                      det_aud_id: 0,
                      det_type_id: 2,
                      det_category: "",
                      det_country: "",
                      det_lastname: "",
                      det_firstname: "",
                      det_date: "",
                    },
                  ],
            3:
              grouped[3].length > 0
                ? grouped[3]
                : [
                    {
                      det_id: 0,
                      det_aud_id: 0,
                      det_type_id: 3,
                      det_category: "",
                      det_country: "",
                      det_lastname: "",
                      det_firstname: "",
                      det_date: "",
                    },
                  ],
          });
        }

        if (opRes.ok && Array.isArray(opJson.data)) {
          setOpRows(
            opJson.data.length > 0
              ? opJson.data
              : [
                  {
                    op_id: 0,
                    op_aud_id: 0,
                    op_code: "",
                    op_name: "",
                    op_date: "",
                  },
                ]
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [auditId]);

  const handleSaveAll = async () => {
    try {
      setSaving(true);

      const detail_raw_data = Object.values(detailRows)
        .flat()
        .map((row) => ({
          det_id: row.det_id,
          det_type_id: row.det_type_id,
          det_category: row.det_category,
          det_country: row.det_country,
          det_lastname: row.det_lastname,
          det_firstname: row.det_firstname,
          det_date: row.det_date ? new Date(row.det_date) : null,
        }));

      const op_raw_data = opRows.map((row) => ({
        op_id: row.op_id,
        op_code: row.op_code,
        op_name: row.op_name,
        op_date: row.op_date ? new Date(row.op_date) : null,
      }));

      const [detailRes, opRes] = await Promise.all([
        fetchWithAuth(`/api/audit/company/detail/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aud_id: auditId,
            detail_raw_data,
          }),
        }),
        fetchWithAuth(`/api/audit/company/operation/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aud_id: auditId,
            op_raw_data,
          }),
        }),
      ]);

      // response check
      if (!detailRes.ok || !opRes.ok) {
        const err1 = await detailRes.json().catch(() => ({}));
        const err2 = await opRes.json().catch(() => ({}));

        throw new Error(err1?.message || err2?.message || "Хадгалахад алдаа гарлаа");
      }

      alert("Амжилттай хадгаллаа");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Уншиж байна...</div>;

  return (
    <>
      <div>
        {/* Үндсэн мэдээлэл */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-800">Үндсэн мэдээлэл</h2>

          <div className="overflow-x-auto rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-gray-100  top-0">
                <tr>
                  {[
                    "Регистрийн дугаар",
                    "Оноосон нэр",
                    "Бүртгэсэн огноо",
                    "Хэлбэр",
                    "Төрөл",
                    "Хувьцаа эзэмшигчийн тоо",
                    "Хуулийн этгээдийн хаяг",
                  ].map((item) => (
                    <th key={item} className="border px-2 py-3 text-center font-medium">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-3">{orgData.org_regno || "-"}</td>
                  <td className="border px-2 py-3">{orgData.org_legal_name || "-"}</td>
                  <td className="border px-2 py-3">{orgData.org_founded_date}</td>
                  <td className="border px-2 py-3">-</td>
                  <td className="border px-2 py-3">{orgData.org_type || "-"}</td>
                  <td className="border px-2 py-3">{orgData.org_main_operation || "-"}</td>
                  <td className="border px-2 py-3">{orgData.org_address || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        {/* Хувьцаа эзэмшигч мэдээлэл */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-800">Хувьцаа эзэмшигч мэдээлэл</h2>
          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100  top-0">
                <tr>
                  <th className="px-3 py-2 w-10">№</th>
                  <th className="px-3 py-2">Ангилал</th>
                  <th className="px-3 py-2">Улсын нэр</th>
                  <th className="px-3 py-2">Эцэг/эхийн нэр</th>
                  <th className="px-3 py-2">Нэр</th>
                  <th className="px-3 py-2 w-1/10">Бүртгэсэн огноо</th>
                  <th className="px-3 py-2 w-10">
                    <button
                      type="button"
                      onClick={() => addRow(1)}
                      className="flex items-center justify-center w-7 h-7 rounded bg-blue-500 px-3 py-1 text-white text-sm"
                    >
                      +
                    </button>
                  </th>
                </tr>
              </thead>

              <tbody>
                {detailRows[1]?.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="border-b px-3 py-2 text-center font-medium text-gray-600">
                      {index + 1}
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_category}
                        onChange={(e) => updateRow(1, index, "det_category", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_country}
                        onChange={(e) => updateRow(1, index, "det_country", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_lastname}
                        onChange={(e) => updateRow(1, index, "det_lastname", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_firstname}
                        onChange={(e) => updateRow(1, index, "det_firstname", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <DatePicker
                        id={`det_date_1_${index}`}
                        placeholder="Огноо сонгох"
                        value={row.det_date || ""}
                        onChange={(selectedDates) => {
                          updateRow(
                            1,
                            index,
                            "det_date",
                            selectedDates?.[0] ? selectedDates[0].toISOString().slice(0, 10) : ""
                          );
                        }}
                        size="sm"
                      />
                    </td>
                    <td className="border-b px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(1, index)}
                        disabled={detailRows[1].length === 1}
                        className="flex items-center justify-center w-7 h-7 rounded hover:bg-red-100 text-red-500 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Албан тушаалтан */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-800">
            Итгэмжлэлгүйгээр төлөөлөх эрх бүхий албан тушаалтан, эрх барих этгээдийн мэдээлэл
          </h2>

          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100  top-0">
                <tr>
                  <th className="px-3 py-2 w-10">№</th>
                  <th className="px-3 py-2">Албан тушаал</th>
                  <th className="px-3 py-2">Улсын нэр</th>
                  <th className="px-3 py-2">Эцэг/эхийн нэр</th>
                  <th className="px-3 py-2">Нэр</th>
                  <th className="px-3 py-2 w-1/10">Бүртгэсэн огноо</th>
                  <th className="px-3 py-2 w-10">
                    <button
                      type="button"
                      onClick={() => addRow(2)}
                      className="flex items-center justify-center w-7 h-7 rounded bg-blue-500 px-3 py-1 text-white text-sm"
                    >
                      +
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailRows[2]?.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="border-b px-3 py-2 text-center font-medium text-gray-600">
                      {index + 1}
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_category}
                        onChange={(e) => updateRow(2, index, "det_category", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_country}
                        onChange={(e) => updateRow(2, index, "det_country", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_lastname}
                        onChange={(e) => updateRow(2, index, "det_lastname", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_firstname}
                        onChange={(e) => updateRow(2, index, "det_firstname", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <DatePicker
                        id={`det_date_2_${index}`}
                        placeholder="Огноо сонгох"
                        value={row.det_date || ""}
                        onChange={(selectedDates) => {
                          updateRow(
                            2,
                            index,
                            "det_date",
                            selectedDates?.[0] ? selectedDates[0].toISOString().slice(0, 10) : ""
                          );
                        }}
                        size="sm"
                      />
                    </td>
                    <td className="border-b px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(2, index)}
                        disabled={detailRows[2].length === 1}
                        className="flex items-center justify-center w-7 h-7 rounded hover:bg-red-100 text-red-500 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Эцсийн өмчлөгч */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-800">Эцсийн өмчлөгч</h2>

          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100  top-0">
                <tr>
                  <th className="px-3 py-2 w-10">№</th>
                  <th>Ангилал</th>
                  <th>Улсын нэр</th>
                  <th>Эцэг/эхийн нэр</th>
                  <th>Нэр</th>
                  <th className="px-3 py-2 w-1/10">Бүртгэсэн огноо</th>
                  <th className="px-3 py-2 w-10">
                    <button
                      type="button"
                      onClick={() => addRow(3)}
                      className="flex items-center justify-center w-7 h-7 rounded bg-blue-500 px-3 py-1 text-white text-sm"
                    >
                      +
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailRows[3]?.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="border-b px-3 py-2 text-center font-medium text-gray-600">
                      {index + 1}
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_category}
                        onChange={(e) => updateRow(3, index, "det_category", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_country}
                        onChange={(e) => updateRow(3, index, "det_country", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_lastname}
                        onChange={(e) => updateRow(3, index, "det_lastname", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.det_firstname}
                        onChange={(e) => updateRow(3, index, "det_firstname", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <DatePicker
                        id={`det_date_3_${index}`}
                        placeholder="Огноо сонгох"
                        value={row.det_date || ""}
                        onChange={(selectedDates) => {
                          updateRow(
                            3,
                            index,
                            "det_date",
                            selectedDates?.[0] ? selectedDates[0].toISOString().slice(0, 10) : ""
                          );
                        }}
                        size="sm"
                      />
                    </td>
                    <td className="border-b px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(3, index)}
                        disabled={detailRows[3].length === 1}
                        className="flex items-center justify-center w-7 h-7 rounded hover:bg-red-100 text-red-500 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <div>
        {/* Үйл ажиллагааны чиглэл */}
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-800">
            Үйл ажиллагааны чиглэлийн мэдээлэл
          </h2>

          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100  top-0">
                <tr>
                  <th className="px-3 py-2 w-10">№</th>
                  <th>Үйл ажиллагааны код</th>
                  <th>Үйл ажиллагааны чиглэл</th>
                  <th className="px-3 py-2 w-1/10">Бүртгэсэн огноо</th>
                  <th className="px-3 py-2 w-10">
                    <button
                      type="button"
                      onClick={addOPRow}
                      className="flex items-center justify-center w-7 h-7 rounded bg-blue-500 px-3 py-1 text-white text-sm"
                    >
                      +
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {opRows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="border-b px-3 py-2 text-center font-medium text-gray-600">
                      {index + 1}
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.op_code}
                        onChange={(e) => updateOPRow(index, "op_code", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <input
                        value={row.op_name}
                        onChange={(e) => updateOPRow(index, "op_name", e.target.value)}
                        className="w-full rounded-md border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    <td className="border-b px-2 py-1">
                      <DatePicker
                        id={`op_date_${index}`}
                        placeholder="Огноо сонгох"
                        value={row.op_date || ""}
                        onChange={(selectedDates) => {
                          updateOPRow(
                            index,
                            "op_date",
                            selectedDates?.[0] ? selectedDates[0].toISOString().slice(0, 10) : ""
                          );
                        }}
                        size="sm"
                      />
                    </td>
                    <td className="border-b px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeOPRow(index)}
                        disabled={opRows.length === 1}
                        className="flex items-center justify-center w-7 h-7 rounded hover:bg-red-100 text-red-500 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {saving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </div>
      </div>
    </>
  );
}
