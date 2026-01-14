// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { XakOrg } from "./types";
import { Button } from "@/components/ui/button";

type ColumnActions = {
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
};

export const columns = (actions: ColumnActions): ColumnDef<XakOrg>[] => [
  {
    accessorKey: "name",
    header: "Нэр",
  },
  {
    accessorKey: "reg_no",
    header: "Регистр",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => actions.onEdit(row.original.id)}>
          Засах
        </Button>

        <Button size="sm" variant="destructive" onClick={() => actions.onRemove(row.original.id)}>
          Устгах
        </Button>
      </div>
    ),
  },
];
