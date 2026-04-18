"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export type Column<T> = {
  key: keyof T | string;
  title: string;
  width?: string;
  render?: (row: T) => ReactNode;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => number | string;

  renderExpanded?: (row: T) => ReactNode;

  onAdd?: () => void; // dialog trigger
};

export default function ExpandableDataTable<T>({
  data,
  columns,
  getRowId,
  renderExpanded,
  onAdd,
}: Props<T>) {
  const [expandedRow, setExpandedRow] = useState<number | string | null>(null);

  const toggle = (id: number | string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-xl border dark:border-gray-800">
      {/* Header */}
      {onAdd && (
        <div className="flex justify-end p-2">
          <button onClick={onAdd} className="rounded-lg bg-blue-600 px-3 py-1 text-white">
            Add
          </button>
        </div>
      )}

      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {renderExpanded && <th className="w-10"></th>}
            {columns.map((col) => (
              <th key={String(col.key)} className="p-2 text-left">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row) => {
            const id = getRowId(row);
            const isOpen = expandedRow === id;

            return (
              <>
                <tr
                  key={String(id)}
                  className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {renderExpanded && (
                    <td className="p-2">
                      <button onClick={() => toggle(id)}>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  )}

                  {columns.map((col) => (
                    <td key={String(col.key)} className="p-2">
                      {col.render ? col.render(row) : String((row as any)[col.key])}
                    </td>
                  ))}
                </tr>

                {isOpen && renderExpanded && (
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={columns.length + 1}>{renderExpanded(row)}</td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
