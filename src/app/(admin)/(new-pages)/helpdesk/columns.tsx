// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Task, TaskForAdmin } from "./types";
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

export const columnsAdmin = (actions: ColumnActions): ColumnDef<TaskForAdmin>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true },
    enableSorting: false,
  },
  { accessorKey: "org_register_no", header: "ХАК регистр" },
  { accessorKey: "org_legal_name", header: "ХАК нэр" },
  { accessorKey: "task_code", header: "Тусламжийн код" },
  { accessorKey: "task_date", header: "Огноо" },
  { accessorKey: "task_status_label", header: "Төлөв" },
  { accessorKey: "task_priority_name", header: "Түвшин" },
  { accessorKey: "task_title", header: "Агуулга" },
  { accessorKey: "aud_name", header: "Аудитын нэр" },
];

export const columns = (actions: ColumnActions): ColumnDef<Task>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center" },
    enableSorting: false,
  },
  { accessorKey: "task_code", header: "Тусламжийн код" },
  { accessorKey: "task_date", header: "Огноо" },
  { accessorKey: "task_status_label", header: "Төлөв" },
  { accessorKey: "task_priority_name", header: "Түвшин" },
  { accessorKey: "task_title", header: "Агуулга" },
  { accessorKey: "aud_name", header: "Аудитын нэр" },
];
