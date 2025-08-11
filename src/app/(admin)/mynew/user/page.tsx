"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/DataTable";

type User = {
  id: number;
  name: string;
  email: string;
};

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

const columns: ColumnDef<User>[] = [
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
];

export function User() {
  return <DataTable columns={columns} data={users} />;
}
