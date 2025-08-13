import { ColumnDef } from "@tanstack/react-table";
import type { User } from "./userType";
import UserModal from "./userDialog";
import { Button } from "@/components/ui/button";

export const columns = (
  onEdit: (user: User) => void,
  onDelete: (id: number) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: (info) => info.row.index + 1,
  },

  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "emailVerified",
    header: "Verified",
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
