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
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </Button>

      {visiblePages().map((p, i) =>
        typeof p === "number" ? (
          <Button
            key={i}
            size="sm"
            variant={p === page ? "default" : "outline"}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ) : (
          <span key={i} className="px-2">
            {p}
          </span>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
