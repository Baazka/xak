"use client";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import type { TaskForAdmin } from "./types";
import { columns, columnsAdmin } from "./columns";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SortingState, VisibilityState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permission";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/tables/SkeletonTable";
import { downloadExcel } from "@/lib/downloadExcel";
import HelpdeskDialog from "./components/helpdeskDialog";

export default function Audit() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  // const canCreate = hasPermission(user?.permissions, ["user.create"]);
  // const canUpdate = hasPermission(user?.permissions, ["user.update"]);
  // const canDelete = hasPermission(user?.permissions, ["user.delete"]);
  const [isadmin, setIsadmin] = useState(false);

  const [data, setData] = useState<TaskForAdmin[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const sortBy = useMemo(() => sorting[0]?.id ?? "task_id", [sorting]);
  const sortOrder = useMemo(() => (sorting[0]?.desc ? "desc" : "asc"), [sorting]);
  const [open, setOpen] = useState(false);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    task_code: true, // default hide
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);

      try {
        const res = await fetchWithAuth(
          `/api/helpdesk?page=${page}&limit=${limit}&search=${encodeURIComponent(
            search
          )}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `API error: ${res.status}`);
        }

        const json = await res.json();
        setData(json.data);
        setTotal(json.total);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        toast("error", err?.message || "Мэдээлэл ачааллах үед алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };

    const userLvl = user?.user_level_id ?? 99;
    if (!userLvl || userLvl === 99) {
      throw new Error("Хэрэглэгчийн түвшин олдсонгүй");
    }
    if (userLvl < 3) {
      setIsadmin(true);
    }

    run();
    return () => controller.abort();
  }, [page, limit, search, sortBy, sortOrder, reloadKey, toast]);

  const handleDownload = async () => {
    try {
      const sortBy = sorting[0]?.id ?? "id";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      await downloadExcel({
        endpoint: "/api/helpdesk/export",
        filenamePrefix: "task",
        params: { search, sortBy, sortOrder },
      });

      toast("success", "Excel файл амжилттай татлагдлаа");
    } catch (e: any) {
      toast("error", e?.message || "Excel татах үед алдаа гарлаа");
    }
  };

  const handleCreate = () => {
    setOpen(true);
  };

  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Тусламжийн хүсэлтийн жагсаалт" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Жагсаалт</h3>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownload}>
              Татах
              {/* icon... */}
            </Button>
            {canCreate && (
              <Button
                onClick={handleCreate}
                className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                Шинэ бүртгэл
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-b-xl overflow-visible">
          {loading ? (
            <SkeletonTable />
          ) : isadmin ? (
            <DataTable
              columns={columnsAdmin({
                page,
                limit,
                deleteLoadingId,
                openMenuId,
                setOpenMenuId,
              })}
              data={data}
              total={total}
              page={page}
              limit={limit}
              search={searchInput}
              onSearchChange={setSearchInput}
              sorting={sorting}
              loading={loading}
              onPageChange={setPage}
              onSortingChange={setSorting}
              onLimitChange={setLimit}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
            />
          ) : (
            <DataTable
              columns={columns({
                page,
                limit,
                deleteLoadingId,
                openMenuId,
                setOpenMenuId,
              })}
              data={data}
              total={total}
              page={page}
              limit={limit}
              search={searchInput}
              onSearchChange={setSearchInput}
              sorting={sorting}
              loading={loading}
              onPageChange={setPage}
              onSortingChange={setSorting}
              onLimitChange={setLimit}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
            />
          )}
        </div>
      </div>
      <HelpdeskDialog
        open={open}
        onOpenChange={setOpen}
        onSaved={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
