// components/tables/SkeletonTable.tsx
import React from "react";

type Props = {
  rows?: number;
  columns?: number;
};

export default function SkeletonTable({ rows = 10, columns = 6 }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Table skeleton */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-6 gap-4 px-5 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
