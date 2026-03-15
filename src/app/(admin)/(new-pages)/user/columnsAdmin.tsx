// columnsAdmin.tsx
import { ColumnDef } from "@tanstack/react-table";
import { UserForAdmin } from "./types";
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import { Pencil, Mail } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

type ColumnActions = {
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;

  canUpdate: boolean;
  canDelete: boolean;
  page: number;
  limit: number;
  deleteLoadingId?: number | null;

  openMenuId: number | null;
  setOpenMenuId: React.Dispatch<React.SetStateAction<number | null>>;
};

export const columnsAdmin = (actions: ColumnActions): ColumnDef<UserForAdmin>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center" },
    enableSorting: false,
  },
  { accessorKey: "org_register_no", header: "ХАК регистр" },
  { accessorKey: "org_legal_name", header: "ХАК нэр" },
  { accessorKey: "org_phone", header: "ХАК утас" },
  { accessorKey: "org_email", header: "ХАК мэйл" },
  { accessorKey: "role_text", header: "Эрхийн түвшин" },
  { accessorKey: "user_register_no", header: "Регистр" },
  { accessorKey: "user_firstname", header: "Нэр" },
  { accessorKey: "user_phone", header: "Утас" },
  { accessorKey: "user_email", header: "И-мэйл" },
  { accessorKey: "user_regdate", header: "Бүргэсэн огноо" },
  {
    id: "actions",
    enableSorting: false,
    meta: { className: "w-[60px] text-center" },
    cell: ({ row }) => {
      const org = row.original;
      const id = org.user_id;
      const deleting = actions.deleteLoadingId === id;

      const menuActions = [
        ...(actions.canUpdate
          ? [
              {
                key: "edit",
                label: "Засах",
                icon: <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                onClick: () => actions.onEdit(id),
              },
            ]
          : []),

        ...(actions.canDelete
          ? [
              {
                key: "delete",
                custom: (
                  <DeleteConfirmDialog loading={deleting} onConfirm={() => actions.onRemove(id)} />
                ),
              },
            ]
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
