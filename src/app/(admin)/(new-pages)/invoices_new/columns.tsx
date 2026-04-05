// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { InvoiceList } from "./types";
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import { Pencil, Mail } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

type ColumnActions = {
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
  onPayment: (id: number) => void;

  canUpdate: boolean;
  canDelete: boolean;
  canPayment: boolean;
  page: number;
  limit: number;
  deleteLoadingId?: number | null;

  openMenuId: number | null;
  setOpenMenuId: React.Dispatch<React.SetStateAction<number | null>>;
};

export const columns = (actions: ColumnActions): ColumnDef<InvoiceList>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true, hideFromToggle: true },
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "org_register_no", header: "ХАК регистр", enableHiding: false },
  { accessorKey: "org_legal_name", header: "ХАК нэр", enableHiding: false },
  { accessorKey: "inv_no", header: "Нэхэмжлэх #", enableHiding: false },
  { accessorKey: "inv_date", header: "Огноо" },
  { accessorKey: "inv_type_name", header: "Төрөл" },
  { accessorKey: "inv_aud_count", header: "Аудит эрх" },
  { accessorKey: "inva_assign", header: "Ашигласан" },
  {
    id: "inv_amount",
    header: "Нийт дүн",
    cell: ({ row }) => row.original.inv_amount.toLocaleString("en-US") + "₮",
  },
  { accessorKey: "inv_status_name", header: "Төлөв", enableHiding: false },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    meta: { className: "w-[60px] text-center" },
    cell: ({ row }) => {
      const inv = row.original;
      const id = inv.inv_id;
      const inv_status = inv.inv_status_id === 1;
      const deleting = actions.deleteLoadingId === id;

      const menuActions = [
        ...(actions.canUpdate
          ? inv_status
            ? [
                {
                  key: "edit",
                  label: "Засах",
                  icon: <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  onClick: () => actions.onEdit(id),
                },
              ]
            : []
          : []),
        ...(actions.canDelete
          ? inv_status
            ? [
                {
                  key: "delete",
                  custom: (
                    <DeleteConfirmDialog
                      loading={deleting}
                      onConfirm={() => actions.onRemove(id)}
                    />
                  ),
                },
              ]
            : []
          : []),
      ];

      return (
        <div className="flex justify-center">
          <RowActionsMenu
            actions={menuActions}
            open={actions.openMenuId === id}
            disabled={deleting}
            onOpenChange={(open) => actions.setOpenMenuId(open ? id : null)}
          />
        </div>
      );
    },
  },
];

export const columnsXak = (actions: ColumnActions): ColumnDef<InvoiceList>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true, hideFromToggle: true },
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "inv_no", header: "Нэхэмжлэх #", enableHiding: false },
  { accessorKey: "inv_date", header: "Огноо" },
  { accessorKey: "inv_type_name", header: "Төрөл" },
  { accessorKey: "inv_aud_count", header: "Аудит эрх" },
  { accessorKey: "inva_assign", header: "Ашигласан" },
  {
    id: "inv_amount",
    header: "Нийт дүн",
    cell: ({ row }) => row.original.inv_amount.toLocaleString("en-US") + "₮",
  },
  { accessorKey: "inv_status_name", header: "Төлөв", enableHiding: false },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    meta: { className: "w-[60px] text-center" },
    cell: ({ row }) => {
      const inv = row.original;
      const id = inv.inv_id;
      const inv_status = inv.inv_status_id === 1;
      const deleting = actions.deleteLoadingId === id;

      const menuActions = [
        ...(actions.canPayment
          ? inv_status
            ? [
                {
                  key: "payment",
                  label: "Төлөлт хийх",
                  icon: <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                  onClick: () => actions.onPayment(id),
                },
              ]
            : []
          : []),
      ];

      return (
        <div className="flex justify-center">
          <RowActionsMenu
            actions={menuActions}
            open={actions.openMenuId === id}
            disabled={deleting}
            onOpenChange={(open) => actions.setOpenMenuId(open ? id : null)}
          />
        </div>
      );
    },
  },
];
