"use client";

import { ReactNode, Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export type Column<T> = {
  key: keyof T | string;
  title: string;
  width?: string;
  className?: string;
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

  const toggle = (id: number | string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse text-sm ${tableClassName}`}>
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {renderExpanded && (
                <th className="w-12 border border-gray-200 p-2 dark:border-gray-700"></th>
              )}

              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`border border-gray-200 p-2 text-left font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-100 ${col.className ?? ""}`}
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
                      <td className="border border-gray-200 p-2 text-center dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => toggle(id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    )}

                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={`border border-gray-200 p-2 align-top text-gray-700 dark:border-gray-700 dark:text-gray-200 ${col.className ?? ""}`}
                      >
                        {col.render ? col.render(row, index) : String((row as any)[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>

                  {isOpen && renderExpanded && (
                    <tr className="bg-gray-50 dark:bg-gray-800/60">
                      <td
                        colSpan={columns.length + 1}
                        className="border border-gray-200 p-0 dark:border-gray-700"
                      >
                        <div className="p-4">{renderExpanded(row, index)}</div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
