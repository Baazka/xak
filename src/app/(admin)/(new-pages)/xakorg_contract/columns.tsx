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
  { accessorKey: "org_legal_name", header: "Байгууллагын нэр" },
  {
    id: "org_status",
    header: "Төлөв код",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <div>
          <Badge
            size="sm"
            color={status === "ACTIVE" ? "success" : status === "PENDING" ? "warning" : "error"}
          >
            {row.original.status}
          </Badge>
        </div>
      );
    },
  },
];
