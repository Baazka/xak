"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  ColumnDef,
  OnChangeFn,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowsPerPage } from "./DataTableRowsPerPage";
import { SearchInput } from "./DataTableSearchInput";
import { Pagination } from "./DataTablePagination";
import { TotalRows } from "./DataTableTotalRows";
import { AngleDownIcon, AngleUpIcon } from "@/icons";

type Props<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  total: number;
  page: number;
  limit: number;
  search: string;
  sorting: SortingState;
  loading?: boolean;
  onSearchChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onSortingChange: OnChangeFn<SortingState>;
  onLimitChange: (l: number) => void;
};

export function DataTable<TData>({
  columns,
  data,
  total,
  page,
  limit,
  search,
  sorting,
  loading = false,
  onSearchChange,
  onPageChange,
  onSortingChange,
  onLimitChange,
}: Props<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualSorting: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange,
    pageCount: Math.ceil(total / limit),
  });

  const pageCount = Math.ceil(total / limit);

  return (
    <div>
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div className="flex gap-3 sm:justify-between">
          <RowsPerPage
            value={limit}
            onChange={(v) => {
              onLimitChange(v);
              onPageChange(1);
            }}
          />
          <SearchInput value={search} onChange={onSearchChange} />
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto custom-scrollbar">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}
                    className={`sticky top-0 z-10 bg-white dark:bg-[#0b1220]
    px-4 py-3 border border-gray-100 dark:border-white/[0.05]
    ${h.column.getCanSort() ? "cursor-pointer select-none" : ""}
    ${h.column.columnDef.meta?.className ?? ""}`}
                  >
                    {h.isPlaceholder ? null : (
                      <div
                        className={`flex items-center justify-between ${
                          h.column.getCanSort() ? "cursor-pointer select-none" : ""
                        }`}
                      >
                        <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </p>

                        {h.column.getCanSort() && (
                          <div className="flex flex-col gap-0.5 ml-2">
                            <AngleUpIcon
                              className={`text-gray-300 dark:text-gray-700 ${
                                h.column.getIsSorted() === "asc" ? "text-brand-500" : ""
                              }`}
                            />
                            <AngleDownIcon
                              className={`text-gray-300 dark:text-gray-700 ${
                                h.column.getIsSorted() === "desc" ? "text-brand-500" : ""
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`px-4 font-normal text-gray-800 border border-gray-100
    dark:border-white/[0.05] text-theme-sm dark:text-gray-400 whitespace-nowrap
    ${cell.column.columnDef.meta?.className ?? ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Өгөгдөл байхгүй.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
        <div className="pb-3 sm:pb-0">
          <TotalRows total={total} />
        </div>
        <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-gray-50 p-4 sm:w-auto sm:justify-normal sm:rounded-none sm:bg-transparent sm:p-0 dark:bg-gray-900 dark:sm:bg-transparent">
          <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
        </div>
      </div>
    </div>
  );
}
