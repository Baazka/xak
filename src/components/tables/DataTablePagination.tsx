"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
};

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  // simple page numbers array
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const visiblePages = () => {
    const delta = 1; // current-ийн өмнө ба дараа хэдийг харуулах
    const range = [];
    const left = Math.max(1, page - delta);
    const right = Math.min(pageCount, page + delta);

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (left > 2) range.unshift("…"); // эхэнд "…"
    if (left > 1) range.unshift(1); // 1-ийг нэмэх

    if (right < pageCount - 1) range.push("…"); // төгсгөлд "…"
    if (right < pageCount) range.push(pageCount); // хамгийн сүүлийн page

    return range;
  };

  return (
    <div className="flex items-center justify-center">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
      >
        {"<<"}
      </Button>
      <div className="flex items-center gap-2">
        {visiblePages().map((p, i) =>
          typeof p === "number" ? (
            <Button
              key={i}
              size="sm"
              onClick={() => onPageChange(p)}
              className={`px-4 py-2 rounded ${
                p === page ? "bg-brand-500 text-white" : "text-gray-700 dark:text-gray-400"
              } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
            >
              {p}
            </Button>
          ) : (
            <span key={i} className="px-2">
              {p}
            </span>
          )
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        {">>"}
      </Button>
    </div>
  );
}
