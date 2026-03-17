"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { NotificationAdminRow } from "./page";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

type ColProps = {
  page: number;
  limit: number;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  deleteLoadingId: number | null;
  onDelete: (id: number) => void;
};

export function notificationAdminColumns({
  page,
  limit,
  deleteLoadingId,
  onDelete,
}: ColProps): ColumnDef<NotificationAdminRow>[] {
  return [
    {
      accessorKey: "rownum",
      header: "№",
      cell: ({ row }) => (page - 1) * limit + row.index + 1,
      enableSorting: false,
    },
    {
      accessorKey: "noti_title",
      header: "Гарчиг",
      cell: ({ row }) => (
        <div className="max-w-[320px] truncate font-medium">{row.original.noti_title}</div>
      ),
    },
    {
      accessorKey: "noti_type_name",
      header: "Төрөл",
      cell: ({ row }) => row.original.noti_type_name ?? "-",
    },
    {
      accessorKey: "target_type_code",
      header: "Target",
      cell: ({ row }) => row.original.target_type_code ?? "-",
    },
    {
      accessorKey: "recipient_count",
      header: "Хүлээн авагч",
      cell: ({ row }) => row.original.recipient_count ?? 0,
    },
    {
      accessorKey: "created_by_name",
      header: "Үүсгэсэн",
      cell: ({ row }) => row.original.created_by_name ?? "-",
    },
    {
      accessorKey: "created_date",
      header: "Огноо",
      cell: ({ row }) => {
        const v = row.original.created_date;
        if (!v) return "-";
        return new Date(v).toLocaleString("mn-MN");
      },
    },
    {
      id: "actions",
      header: "Үйлдэл",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        const deleting = deleteLoadingId === item.id;

        return (
          <div className="flex items-center gap-2">
            <DeleteConfirmDialog loading={deleting} onConfirm={() => onDelete(item.id)} />
          </div>
        );
      },
    },
  ];
}
