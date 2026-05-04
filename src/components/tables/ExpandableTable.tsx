"use client";

import { ReactNode, Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export type Column<T> = {
  key: keyof T | string;
  title: string;
  width?: string;
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => ReactNode;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => number | string;
  renderExpanded?: (row: T, index: number) => ReactNode;
  tableClassName?: string;
};

export default function ExpandableDataTable<T>({
  data,
  columns,
  getRowId,
  renderExpanded,
  tableClassName = "",
}: Props<T>) {
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});

  const allOpen = data.length > 0 && data.every((row) => expandedRows[getRowId(row)]);

  const toggle = (id: number | string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAll = () => {
    if (allOpen) {
      setExpandedRows({});
      return;
    }

    const next: Record<string | number, boolean> = {};
    data.forEach((row) => {
      next[getRowId(row)] = true;
    });

    setExpandedRows(next);
  };

  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-sm mb-2 ${tableClassName}`}>
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            {renderExpanded && (
              <th className="w-[50px] border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
                  title={allOpen ? "Бүгдийг хаах" : "Бүгдийг нээх"}
                >
                  {allOpen ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              </th>
            )}

            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`border border-gray-200 p-2 text-center text-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                  col.headerClassName ?? col.className ?? ""
                }`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const id = getRowId(row);
            const isOpen = !!expandedRows[id];

            return (
              <Fragment key={String(id)}>
                <tr className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60">
                  {renderExpanded && (
                    <td className="w-[50px] border border-gray-200 p-2 text-center dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
                      >
                        {isOpen ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </button>
                    </td>
                  )}

                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`border border-gray-200 p-2 text-gray-700 dark:border-gray-700 dark:text-gray-200 ${
                        col.className ?? ""
                      }`}
                    >
                      {col.render ? col.render(row, index) : String((row as any)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>

                {isOpen && renderExpanded && (
                  <tr className="bg-gray-50 dark:bg-gray-800/60">
                    <td
                      colSpan={columns.length + 1}
                      className="border border-gray-200 p-2 dark:border-gray-700"
                    >
                      {renderExpanded(row, index)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
