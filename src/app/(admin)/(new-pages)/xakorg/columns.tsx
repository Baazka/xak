// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { XakOrg } from "./types";
import { Button } from "@/components/ui/button";

type ColumnActions = {
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
  canUpdate: boolean;
  canDelete: boolean;
  page: number;
  limit: number;
};

export const columns = (actions: ColumnActions): ColumnDef<XakOrg>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => {
      return (actions.page - 1) * actions.limit + row.index + 1;
    },
    meta: {
      className: "w-[30px] text-center",
    },
  },
  {
    accessorKey: "name",
    header: "Нэр",
  },
  {
    accessorKey: "email",
    header: "И-мэйл",
  },
  {
    accessorKey: "phone",
    header: "Утас",
  },
  {
    accessorKey: "address",
    header: "Хаяг",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {actions.canUpdate && (
          <Button size="sm" onClick={() => actions.onEdit(row.original.id)}>
            Засах
          </Button>
        )}

        {actions.canDelete && (
          <Button size="sm" variant="destructive" onClick={() => actions.onRemove(row.original.id)}>
            Устгах
          </Button>
        )}
      </div>
    ),
  },
];
