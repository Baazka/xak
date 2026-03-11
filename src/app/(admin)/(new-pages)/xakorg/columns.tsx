// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { XakOrg, XakOrgNew } from "./types";
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import { Pencil, Mail } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

type ColumnActions = {
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
  onInvite: (org: XakOrgNew) => void;

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
    meta: { className: "w-[30px] text-center" },
    enableSorting: false,
  },
  { accessorKey: "org_register_no", header: "ХАК регистр" },
  { accessorKey: "org_legal_name", header: "ХАК нэр" },
  { accessorKey: "org_phone", header: "ХАК утас" },
  { accessorKey: "org_email", header: "ХАК мэйл" },
  { accessorKey: "org_address", header: "ХАК хаяг" },
  { accessorKey: "org_head_name", header: "Удирдлага нэр" },
  { accessorKey: "org_head_phone", header: "Удирдлага утас" },
  { accessorKey: "org_head_email", header: "Удирдлага мэйл" },
  { accessorKey: "created_date", header: "Бүртгэгдсэн" },
  // { accessorKey: "org_status", header: "Төлөв" },
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
        // EMAIL ACTION
        {
          key: "invite",
          label: org.org_email ? "Invite / OTP явуулах" : "E-mail байхгүй",
          icon: <Mail className="h-4 w-4" />,
          disabled: !org.org_email,
          onClick: () => actions.onInvite(org),
        },
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
