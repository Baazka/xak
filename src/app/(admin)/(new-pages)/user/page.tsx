"use client";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import type { User } from "./userType";
import { columns } from "./userColumn";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AddUserModal from "./userDialog";
import { Pagination } from "@/components/tables/DataTablePagination";
import { SortingState } from "@tanstack/react-table";

export default function User() {
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchData = () => {
    const sortBy = sorting[0]?.id ?? "id";
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";
    setLoading(true);
    fetch(
      `/api/users?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    )
      .then((r) => r.json())
      .then((json) => {
        setData(json.data);
        setTotal(json.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, sorting]);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        JSON.stringify(id) + " Are you sure you want to delete this user?"
      )
    )
      return;
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", data: id }),
    });
    fetchData();
  };

  const handleEdit = () => {
    fetchData();
  };
  useEffect(() => {
    fetchData();
  }, [page, limit, search, sorting]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Хэрэглэгч" />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-4 py-4 sm:pl-6 sm:pr-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Хэрэглэгчийн жагсаалт
                </h3>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <AddUserModal onSaved={fetchData} />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
              <DataTable
                columns={columns(handleEdit, handleDelete, page, limit)}
                data={data}
                total={total}
                page={page}
                limit={limit}
                search={search}
                sorting={sorting}
                loading={loading}
                onSearchChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                onPageChange={setPage}
                onSortingChange={setSorting}
                onLimitChange={setLimit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
