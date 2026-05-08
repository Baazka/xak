"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import { XakorgContractRow } from "./types";

type ColumnActions = {
  page: number;
  limit: number;
  canUpdate: boolean;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  onEdit: (id: number) => void;
};

export const columns = ({
  page,
  limit,
  canUpdate,
  openMenuId,
  setOpenMenuId,
  onEdit,
}: ColumnActions): ColumnDef<XakorgContractRow>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true },
    enableSorting: false,
  },
  { accessorKey: "contract_name", header: "Гэрээний нэр" },
  { accessorKey: "contract_begin_date", header: "Эхлэх огноо" },
  { accessorKey: "contract_end_date", header: "Дуусах огноо" },
  {
    id: "status",
    header: "Төлөв",
    cell: ({ row }) => (
      <Badge size="sm" color={row.original.status === "ACTIVE" ? "success" : "warning"}>
        {row.original.status ?? "-"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    meta: { className: "w-[60px] text-center" },
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;

      if (!canUpdate) return null;

      return (
        <RowActionsMenu
          open={openMenuId === item.contract_id}
          onOpenChange={(open) => setOpenMenuId(open ? item.contract_id : null)}
          actions={[
            {
              key: "edit",
              label: "Засах",
              icon: <Pencil className="h-4 w-4" />,
              onClick: () => onEdit(item.contract_id),
            },
          ]}
        />
      );
    },
  },
];
