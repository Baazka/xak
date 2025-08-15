import { ColumnDef } from "@tanstack/react-table";
import type { User } from "./userType";
import UserModal from "./userDialog";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash } from "lucide-react";

function SortableHeader({ column, label }: any) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="px-1"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span>{label}</span>
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export const columns = (
  onEdit: (user: User) => void,
  onDelete: (id: number) => void,
  page: number,
  limit: number
): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (page - 1) * limit + row.index + 1,
    enableSorting: false,
  },

  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} label="Name" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} label="Email" />,
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          {/* Edit button */}
          <UserModal user={user} onSaved={() => onEdit(user)} />

          {/* Delete button */}
          <Button variant="destructive" onClick={() => onDelete(user.id)}>
            Устгах
          </Button>
        </div>
      );
    },
  },
];
