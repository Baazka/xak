"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
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
  onSortingChange: (s: SortingState) => void;
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
    <div className="space-y-3">
      <SearchInput value={search} onChange={onSearchChange} />
      <TotalRows total={total} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
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
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Өгөгдөл байхгүй.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={onPageChange}
        />
        <RowsPerPage
          value={limit}
          onChange={(v) => {
            onLimitChange(v);
            onPageChange(1);
          }}
        />
      </div>
    </div>
  );
}
