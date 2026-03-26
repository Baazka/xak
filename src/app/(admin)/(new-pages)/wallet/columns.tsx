// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Wallet } from "./types";
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import { Pencil, Mail } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

type ColumnActions = {
  page: number;
  limit: number;
  deleteLoadingId?: number | null;
};

export const columns = (actions: ColumnActions): ColumnDef<Wallet>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true },
    enableSorting: false,
  },
  { accessorKey: "tran_code", header: "Гүйлгээний #" },
  { accessorKey: "tran_date", header: "Огноо" },
  { accessorKey: "tran_cr_dt", header: "Төрөл" },
  { accessorKey: "tran_amount", header: "Дүн" },
  { accessorKey: "inv_no", header: "Нэхэмжлэх #" },
];
