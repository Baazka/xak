// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { UserForAdmin } from "./types";
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import { Pencil, Mail } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";

type ColumnActions = {
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
    meta: { className: "w-[30px] text-center", noTruncate: true },
    enableSorting: false,
  },
  { accessorKey: "org_register_no", header: "Регистр" },
  { accessorKey: "org_legal_name", header: "Байгууллагын нэр" },
  { accessorKey: "org_phone", header: "Утас" },
  { accessorKey: "org_email", header: "Мэйл" },
  { accessorKey: "role_text", header: "Эрхийн түвшин" },
  { accessorKey: "user_register_no", header: "Регистр" },
  { accessorKey: "user_firstname", header: "Нэр" },
  { accessorKey: "user_phone", header: "Утас" },
  { accessorKey: "user_email", header: "И-мэйл" },
  { accessorKey: "user_regdate", header: "Бүргэсэн огноо" },
];
