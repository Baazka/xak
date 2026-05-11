"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FileCheck, Pencil } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { XakorgContractRow } from "./types";
import { formatDate } from "@/lib/formatDate";

type ColumnActions = {
  page: number;
  limit: number;
  canUpdate: boolean;
  onEdit: (id: number) => void;
  onConfirm: (id: number) => void;
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Хүлээгдэж байна",
  CONFIRMED: "Батлагдсан",
};
export const columns = ({
  page,
  limit,
  canUpdate,
  onEdit,
  onConfirm,
}: ColumnActions): ColumnDef<XakorgContractRow>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true },
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "xakorg_name", header: "Байгууллагын нэр" },
  { accessorKey: "contract_name", header: "Гэрээний нэр" },
  {
    accessorKey: "contract_begin_date",
    header: "Эхлэх огноо",
    meta: {
      className: "w-[150px] text-center",
    },
    cell: ({ row }) => formatDate(row.original.contract_begin_date ?? undefined),
  },
  {
    accessorKey: "contract_end_date",
    header: "Дуусах огноо",
    meta: {
      className: "w-[150px] text-center",
    },
    cell: ({ row }) => formatDate(row.original.contract_end_date ?? undefined),
  },
  {
    id: "status",
    header: "Төлөв",
    meta: {
      className: "w-[150px] text-center",
    },
    cell: ({ row }) => (
      <Badge size="sm" color={row.original.status === "CONFIRMED" ? "success" : "warning"}>
        {STATUS_LABEL[row.original.status] ?? "-"}
      </Badge>
    ),
  },
  {
    id: "contract_file_id",
    header: "Хавсралт",
    meta: {
      className: "w-[150px] text-center",
    },
    cell: ({ row }) =>
      row.original.contract_file_id ? (
        <a
          href={`/api/files/download/${row.original.contract_file_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Хавсралт үзэх
        </a>
      ) : null,
  },
  {
    id: "actions",
    header: "Үйлдэл",
    meta: {
      className: "w-[100px] text-center",
      noTruncate: true,
      hideFromToggle: true,
    },
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex gap-0">
          {item.status === "PENDING" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item.contract_id);
              }}
              className="flex w-full cursor-pointer justify-center text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(item.contract_id);
            }}
            className="flex w-full cursor-pointer justify-center text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
          >
            <FileCheck className="h-4 w-4" />
          </button>
        </div>
      );
    },
  },
];
