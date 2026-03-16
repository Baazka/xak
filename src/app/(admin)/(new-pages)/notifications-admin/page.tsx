"use client";

import { useEffect, useMemo, useState } from "react";
import { SortingState } from "@tanstack/react-table";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from "@/components/tables/DataTable";
import SkeletonTable from "@/components/tables/SkeletonTable";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useToast } from "@/context/ToastContext";
import { notificationAdminColumns } from "./columns";
import NotificationDialog from "../notifications/components/NotificationDialog";

export type NotificationAdminRow = {
  id: number;
  noti_title: string;
  noti_content?: string;
  noti_date?: string;
  created_date?: string;
  noti_type_name?: string;
  target_type_code?: string;
  target_type_name?: string;
  recipient_count?: number;
  target_count?: number;
  created_by_name?: string;
  is_deleted?: number;
};

export default function NotificationsAdminPage() {
  const { toast } = useToast();

  const [data, setData] = useState<NotificationAdminRow[]>([]);
  const [total, setTotal] = useState(0);

  const [listLoading, setListLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const sortBy = useMemo(() => sorting[0]?.id ?? "created_date", [sorting]);
  const sortOrder = useMemo(() => (sorting[0]?.desc ? "desc" : "asc"), [sorting]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchList = async (signal?: AbortSignal) => {
    setListLoading(true);

    try {
      const res = await fetchWithAuth(
        `/api/admin/notifications?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        { signal }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || `API error: ${res.status}`);
      }

      const json = await res.json();
      setData(Array.isArray(json.data) ? json.data : []);
      setTotal(Number(json.total ?? 0));
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      toast("error", err?.message || "Мэдэгдлийн жагсаалт ачааллах үед алдаа гарлаа");
    } finally {
      setListLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchList(controller.signal);
    return () => controller.abort();
  }, [page, limit, search, sortBy, sortOrder]);

  const handleDelete = async (id: number) => {
    try {
      setDeleteLoadingId(id);

      const res = await fetchWithAuth(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Устгах үед алдаа гарлаа");
      }

      toast("success", "Мэдэгдэл устгагдлаа");

      // table data update
      setData((prev) => prev.filter((x) => x.id !== id));

      // total update
      setTotal((prev) => Math.max(prev - 1, 0));
    } catch (err: any) {
      toast("error", err?.message || "Устгах үед алдаа гарлаа");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Мэдэгдэл удирдлага" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Мэдэгдэл удирдлага
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Үүсгэсэн мэдэгдлүүдийг харах, хайх, устгах
            </p>
          </div>

          <div className="flex gap-3">
            <NotificationDialog onCreated={fetchList} />
          </div>
        </div>

        <div className="rounded-b-xl overflow-visible">
          {initialLoading ? (
            <SkeletonTable />
          ) : (
            <DataTable
              columns={notificationAdminColumns({
                page,
                limit,
                openMenuId,
                setOpenMenuId,
                deleteLoadingId,
                onDelete: handleDelete,
              })}
              data={data}
              total={total}
              page={page}
              limit={limit}
              search={searchInput}
              onSearchChange={setSearchInput}
              sorting={sorting}
              loading={listLoading}
              onPageChange={setPage}
              onSortingChange={setSorting}
              onLimitChange={setLimit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
