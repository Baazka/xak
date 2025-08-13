import { ColumnDef } from "@tanstack/react-table";

export type User = {
  id: number;
  name: string;
  email: string;
  emailVerified: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
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
];
