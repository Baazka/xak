import DatePicker from "@/components/form/date-picker";
import { useState } from "react";

type AuditCompanyOwnerFormData = {
  org_regno: string;
  org_legal_name: string;
  org_founded_date: Date | null;
  org_certno: string;
  org_type: string;
  org_main_operation: string;
  org_address: string;
  org_head_name: string;
};
type Row = {
  det_id: number;
  det_aud_id: number;
  det_type_id: number; // 1: хувьцаа эзэмшигч, 2: албан тушаалтан, 3: эцсийн өмчлөгч
  det_category: string;
  det_country: string;
  det_lastname: string;
  det_firstname: string;
  det_date: string;
};
type OperationRow = {
  op_id: number;
  op_aud_id: number;
  op_code: string;
  op_name: string;
  op_date: string;
};

type Props = {
  values: AuditCompanyOwnerFormData;
  rows: Record<number, Row[]>;
  setRows: React.Dispatch<React.SetStateAction<Record<number, Row[]>>>;
  opRows: OperationRow[];
  setOpRows: React.Dispatch<React.SetStateAction<OperationRow[]>>;
};

export default function AuditCompanyOwner({ values, rows, setRows, opRows, setOpRows }: Props) {
  const addRow = (typeId: number) => {
    setRows((prev) => ({
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
  const removeRow = (typeId: number, index: number) => {
    setRows((prev) => ({
      ...prev,
      [typeId]: prev[typeId].filter((_, i) => i !== index),
    }));
  };
  const updateRow = (typeId: number, index: number, field: keyof Row, value: string) => {
    setRows((prev) => ({
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

  const removeOPRow = (index: number) => {
    setOpRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOPRow = (index: number, field: string, value: string) => {
    setOpRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };
  return (
    <div className="space-y-2">
      <section>
        <h2 className="text-base font-semibold py-3">Үндсэн мэдээлэл</h2>

        <div className="overflow-x-auto rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className=" dark:bg-[#0b1220] dark:border-white/[0.05]">
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
              <tr className="odd:bg-white even:bg-gray-100 dark:odd:bg-[#0b1220] dark:even:bg-[#0f172a]">
                <td className="border px-2 py-3">{values.org_regno || "-"}</td>
                <td className="border px-2 py-3">{values.org_legal_name || "-"}</td>
                <td className="border px-2 py-3">
                  {values.org_founded_date ? values.org_founded_date.toLocaleDateString() : "-"}
                </td>
                <td className="border px-2 py-3">-</td>
                <td className="border px-2 py-3">{values.org_type || "-"}</td>
                <td className="border px-2 py-3">{values.org_main_operation || "-"}</td>
                <td className="border px-2 py-3">{values.org_address || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold py-3">Хувьцаа эзэмшигч мэдээлэл</h2>
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className=" dark:bg-[#0b1220] dark:border-white/[0.05]">
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
              {rows[1]?.map((row, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-100 dark:odd:bg-[#0b1220] dark:even:bg-[#0f172a]"
                >
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
                      disabled={rows[1].length === 1}
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

      <section>
        <h2 className="text-base font-semibold py-3">
          Итгэмжлэлгүйгээр төлөөлөх эрх бүхий албан тушаалтан, эрх барих этгээдийн мэдээлэл
        </h2>

        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className=" dark:bg-[#0b1220] dark:border-white/[0.05]">
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
              {rows[2]?.map((row, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-100 dark:odd:bg-[#0b1220] dark:even:bg-[#0f172a]"
                >
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
                      disabled={rows[2].length === 1}
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

      <section>
        <h2 className="text-base font-semibold py-3">Эцсийн өмчлөгч</h2>

        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className=" dark:bg-[#0b1220] dark:border-white/[0.05]">
                <th className="px-3 py-2 w-10">№</th>
                <th className="px-3 py-2">Ангилал</th>
                <th className="px-3 py-2">Улсын нэр</th>
                <th className="px-3 py-2">Эцэг/эхийн нэр</th>
                <th className="px-3 py-2">Нэр</th>
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
              {rows[3]?.map((row, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-100 dark:odd:bg-[#0b1220] dark:even:bg-[#0f172a]"
                >
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
                      disabled={rows[3].length === 1}
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

      <section>
        <h2 className="text-base font-semibold py-3">Үйл ажиллагааны чиглэлийн мэдээлэл</h2>

        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className=" dark:bg-[#0b1220] dark:border-white/[0.05]">
                <th className="px-3 py-2 w-10">№</th>
                <th className="px-3 py-2">Үйл ажиллагааны код</th>
                <th className="px-3 py-2">Үйл ажиллагааны чиглэл</th>
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
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-100 dark:odd:bg-[#0b1220] dark:even:bg-[#0f172a]"
                >
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
    </div>
  );
}
