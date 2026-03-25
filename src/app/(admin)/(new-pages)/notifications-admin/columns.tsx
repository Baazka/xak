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
      meta: { className: "w-[30px] text-center", noTruncate: true },
      enableSorting: false,
    },
    {
      accessorKey: "noti_title",
      header: "Гарчиг",
    },
    {
      accessorKey: "noti_type_name",
      header: "Төрөл",
    },
    {
      accessorKey: "target_type_code",
      header: "Target",
    },
    {
      accessorKey: "recipient_count",
      header: "Хүлээн авагч",
    },
    {
      accessorKey: "created_by_name",
      header: "Үүсгэсэн",
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
          <div className="flex items-center h-5">
            <DeleteConfirmDialog loading={deleting} onConfirm={() => onDelete(item.id)} />
          </div>
        );
      },
    },
  ];
}
