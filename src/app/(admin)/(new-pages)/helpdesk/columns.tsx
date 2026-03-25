// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Task, TaskForAdmin } from "./types";
import RowActionsMenu from "@/components/tables/RowActionsMenu";
import { Pencil, Mail } from "lucide-react";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import Badge from "@/components/ui/badge/Badge";

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
  {
    id: "actions",
    enableSorting: false,
    meta: { className: "w-[60px] text-center" },
    cell: ({ row }) => {
      const org = row.original;
      // const id = org.user_id;
      // const deleting = actions.deleteLoadingId === id;

      // const menuActions = [
      //   ...(actions.canUpdate
      //     ? [
      //         {
      //           key: "edit",
      //           label: "Засах",
      //           icon: <Pencil className="h-4 w-4 text-gray-500 dark:text-gray-400" />,
      //           onClick: () => actions.onEdit(id),
      //         },
      //       ]
      //     : []),

      //   ...(actions.canDelete
      //     ? [
      //         {
      //           key: "delete",
      //           custom: (
      //             <DeleteConfirmDialog loading={deleting} onConfirm={() => actions.onRemove(id)} />
      //           ),
      //         },
      //       ]
      //     : []),
      // ];

      return (
        <div className="flex justify-center">
          {/* <RowActionsMenu
            actions={menuActions}
            open={actions.openMenuId === id}
            disabled={deleting}
            onOpenChange={(open) => actions.setOpenMenuId(open ? id : null)}
          /> */}
          <Badge
            size="sm"
            // color={
            //   transaction.status === "Complete"
            //     ? "success"
            //     : transaction.status === "Pending"
            //       ? "warning"
            //       : "error"
            // }
          >
            {/* {transaction.status} */}
            Badge
          </Badge>
        </div>
      );
    },
  },
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
