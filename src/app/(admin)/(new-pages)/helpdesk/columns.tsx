// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Task, TaskForAdmin } from "./types";
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import { Pencil, Mail } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import Badge from "@/components/ui/badge/Badge";
import Link from "next/link";

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
    meta: { className: "w-[30px] text-center", noTruncate: true, hideFromToggle: true },
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "org_register_no", header: "Регистр", enableHiding: false },
  { accessorKey: "org_legal_name", header: "Байгууллагын нэр", enableHiding: false },
  {
    id: "view",
    header: "Тусламжийн код",
    cell: ({ row }) => {
      return (
        <Link href={`/helpdesk/${row.original.task_id}`}>
          <p className="text-blue-600 hover:underline">{row.original.task_code}</p>
        </Link>
      );
    },
    enableHiding: false,
  },
  { accessorKey: "task_date", header: "Огноо" },
  { accessorKey: "task_status_label", header: "Төлөв" },
  {
    id: "actions",
    header: "Түвшин",
    cell: ({ row }) => {
      const task = row.original;

      return (
        <div>
          <Badge
            size="sm"
            color={
              task.task_priority_name === "Medium"
                ? "success"
                : task.task_priority_name === "High"
                  ? "warning"
                  : task.task_priority_name === "Rare"
                    ? "error"
                    : "info"
            }
          >
            {task.task_priority_name}
          </Badge>
        </div>
      );
    },
  },
  { accessorKey: "task_title", header: "Агуулга" },
  { accessorKey: "aud_name", header: "Аудитын нэр" },
];

export const columns = (actions: ColumnActions): ColumnDef<Task>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true, hideFromToggle: true },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "view",
    header: "Тусламжийн код",
    cell: ({ row }) => {
      return (
        <Link href={`/helpdesk/${row.original.task_id}`}>
          <p className="text-blue-600 hover:underline">{row.original.task_code}</p>
        </Link>
      );
    },
    enableHiding: false,
  },
  { accessorKey: "task_date", header: "Огноо" },
  { accessorKey: "task_status_label", header: "Төлөв" },
  {
    id: "actions",
    header: "Түвшин",
    cell: ({ row }) => {
      const task = row.original;

      return (
        <div>
          <Badge
            size="sm"
            color={
              task.task_priority_name === "Medium"
                ? "success"
                : task.task_priority_name === "High"
                  ? "warning"
                  : task.task_priority_name === "Rare"
                    ? "error"
                    : "info"
            }
          >
            {task.task_priority_name}
          </Badge>
        </div>
      );
    },
  },
  { accessorKey: "task_title", header: "Агуулга" },
  { accessorKey: "aud_name", header: "Аудитын нэр" },
];
