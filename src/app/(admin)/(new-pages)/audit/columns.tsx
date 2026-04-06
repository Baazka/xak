// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Audit, AuditForAdmin } from "./types";
import Link from "next/link";
import { EyeIcon } from "lucide-react";

type ColumnActions = {
  page: number;
  limit: number;
  deleteLoadingId?: number | null;

  openMenuId: number | null;
  setOpenMenuId: React.Dispatch<React.SetStateAction<number | null>>;
};

export const columnsAdmin = (actions: ColumnActions): ColumnDef<AuditForAdmin>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true, hideFromToggle: true },
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "org_register_no", header: "ХАК регистр" },
  { accessorKey: "org_legal_name", header: "ХАК нэр" },
  { accessorKey: "aud_year", header: "Аудитын жил" },
  { accessorKey: "aud_type_name", header: "Аудитын төрөл" },
  { accessorKey: "aud_code", header: "Аудит код" },
  { accessorKey: "aud_name", header: "Аудитын нэр" },
  { accessorKey: "comp_reg_no", header: "Шалгагдагч регистр" },
  { accessorKey: "comp_legal_name", header: "Шалгагдагч нэр" },
  { accessorKey: "aud_begin_date", header: "Эхлэх огноо" },
  { accessorKey: "aud_end_date", header: "Дуусах огноо" },
  { accessorKey: "aud_status_label", header: "Төлөв" },
];

export const columns = (actions: ColumnActions): ColumnDef<Audit>[] => [
  {
    id: "rowNumber",
    header: "№",
    cell: ({ row }) => (actions.page - 1) * actions.limit + row.index + 1,
    meta: { className: "w-[30px] text-center", noTruncate: true, hideFromToggle: true },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "aud_year",
    header: "Аудитын жил",
  },

  {
    accessorKey: "aud_type_name",
    header: "Аудитын төрөл",
  },
  { accessorKey: "aud_code", header: "Аудит код", enableHiding: false },

  {
    accessorKey: "aud_name",
    header: "Аудитын нэр",
    meta: {
      columnLabel: "Аудитын нэр",
    },
  },
  { accessorKey: "comp_reg_no", header: "Шалгагдагч регистр", enableHiding: false },
  { accessorKey: "comp_legal_name", header: "Шалгагдагч нэр", enableHiding: false },
  { accessorKey: "aud_begin_date", header: "Эхлэх огноо" },
  { accessorKey: "aud_end_date", header: "Дуусах огноо" },
  { accessorKey: "aud_status_label", header: "Төлөв", enableHiding: false },
  {
    id: "actions",
    header: "Үйлдэл",
    cell: ({ row }) => (
      <Link
        href={`/auditDetail/${row.original.aud_id}`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center rounded border px-2 py-2"
      >
        <EyeIcon className="h-4 w-4" />
      </Link>
    ),
    meta: {
      className: "w-[100px] text-center",
      noTruncate: true,
      hideFromToggle: true,
    },
    enableSorting: false,
    enableHiding: false,
  },
];
