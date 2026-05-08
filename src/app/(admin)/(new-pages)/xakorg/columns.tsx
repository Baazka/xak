// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { XakOrg, XakOrgNew } from "./types";
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import { Pencil, Mail, CheckCheck } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import Badge from "@/components/ui/badge/Badge";
import { stat } from "fs";

type ColumnActions = {
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
  onInvite: (org: XakOrgNew) => void;
  onConfirm: (id: number) => void;

  canUpdate: boolean;
  canDelete: boolean;
  page: number;
  limit: number;
  deleteLoadingId?: number | null;

  openMenuId: number | null;
  setOpenMenuId: React.Dispatch<React.SetStateAction<number | null>>;
};

export const columns = (actions: ColumnActions): ColumnDef<XakOrgNew>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true },
    enableSorting: false,
  },
  { accessorKey: "org_register_no", header: "Регистр" },
  { accessorKey: "org_legal_name", header: "Байгууллагын нэр" },
  { accessorKey: "org_phone", header: "Утас" },
  { accessorKey: "org_email", header: "Мэйл" },
  { accessorKey: "org_address", header: "Хаяг" },
  { accessorKey: "org_head_name", header: "Удирдлага нэр" },
  { accessorKey: "org_head_phone", header: "Удирдлага утас" },
  { accessorKey: "org_head_email", header: "Удирдлага мэйл" },
  { accessorKey: "created_date", header: "Бүртгэгдсэн" },
  {
    id: "org_status",
    header: "Төлөв код",
    cell: ({ row }) => {
      const status = row.original.org_status;

      return (
        <div>
          <Badge
            size="sm"
            color={status === "ACTIVE" ? "success" : status === "PENDING" ? "warning" : "error"}
          >
            {row.original.org_status_name}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableSorting: false,
    meta: { className: "w-[60px] text-center" },
    cell: ({ row }) => {
      const org = row.original;
      const id = org.org_id;
      const email = org.org_email?.trim();
      const name = org.org_legal_name;
      const deleting = actions.deleteLoadingId === id;
      const status = org.org_status;

      const menuActions = [
        ...(actions.canUpdate && status === "ACTIVE"
          ? [
              {
                key: "edit",
                label: "Засах",
                icon: <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                onClick: () => actions.onEdit(id),
              },
            ]
          : []),
        // EMAIL ACTION
        ...(status === "ACTIVE"
          ? [
              {
                key: "invite",
                label: org.org_email ? "Invite / OTP явуулах" : "E-mail байхгүй",
                icon: <Mail className="h-4 w-4" />,
                disabled: !org.org_email,
                onClick: () => actions.onInvite(org),
              },
            ]
          : []),
        ...(actions.canDelete
          ? [
              {
                key: "delete",
                custom: (
                  <DeleteConfirmDialog
                    loading={deleting}
                    showText={true}
                    onConfirm={() => actions.onRemove(id)}
                  />
                ),
              },
            ]
          : []),
        ...(status === "PENDING"
          ? [
              {
                key: "confirm",
                label: "Баталгаажуулах",
                icon: <CheckCheck className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
                onClick: () => actions.onConfirm(id),
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
