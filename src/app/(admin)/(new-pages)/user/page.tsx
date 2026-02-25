"use client";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import type { User } from "./types";
import { columns } from "./columns";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permission";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/tables/SkeletonTable";
import { downloadExcel } from "@/lib/downloadExcel";
import UserDialog from "./components/UserDialog";

export default function User() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const canCreate = hasPermission(user?.permissions, ["user.create"]);
  const canUpdate = hasPermission(user?.permissions, ["user.update"]);
  const canDelete = hasPermission(user?.permissions, ["user.delete"]);

  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);

  const [listLoading, setListLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const sortBy = useMemo(() => sorting[0]?.id ?? "id", [sorting]);
  const sortOrder = useMemo(() => (sorting[0]?.desc ? "desc" : "asc"), [sorting]);

  const [open, setOpen] = useState(false);

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
      setListLoading(true);

      try {
        const res = await fetchWithAuth(
          `/api/users?page=${page}&limit=${limit}&search=${encodeURIComponent(
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
        setListLoading(false);
        setInitialLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [page, limit, search, sortBy, sortOrder, reloadKey, toast]);

  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    username: string;
    email: string;
  } | null>(null);

  // ✅ New create
  const handleCreate = () => {
    setDialogMode("create");
    setSelectedUser(null);
    setOpen(true);
  };

  // ✅ Edit
  const handleEdit = (id: number) => {
    const u = data.find((x) => x.id === id);
    if (!u) return;

    setDialogMode("edit");
    setSelectedUser({ id: u.id, username: u.username, email: u.email });
    setOpen(true);
  };

  // ✅ Delete
  const handleDelete = async (id: number) => {
    if (deleteLoadingId !== null) return;

    setDeleteLoadingId(id);
    try {
      const res = await fetchWithAuth(`/api/users/${id}`, {
        method: "DELETE",
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || j?.message || "Устгах үед алдаа гарлаа");

      toast("success", "Хэрэглэгч амжилттай устгагдлаа");

      // page дээр ганц мөр байсан бол page бууруулах (optional)
      if (data.length === 1 && page > 1) setPage(page - 1);
      else setReloadKey((k) => k + 1);
    } catch (err: any) {
      toast("error", err?.message || "Устгах үед алдаа гарлаа");
    } finally {
      setDeleteLoadingId(null);
      setOpenMenuId(null);
    }
  };

  const handleDownload = async () => {
    try {
      const sortBy = sorting[0]?.id ?? "id";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      await downloadExcel({
        endpoint: "/api/users/export",
        filenamePrefix: "users",
        params: { search, sortBy, sortOrder },
      });

      toast("success", "Excel файл амжилттай татлагдлаа");
    } catch (e: any) {
      toast("error", e?.message || "Excel татах үед алдаа гарлаа");
    }
  };

  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Хэрэглэгч" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Хэрэглэгчийн жагсаалт
            </h3>
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
          {initialLoading ? (
            <SkeletonTable />
          ) : (
            <DataTable
              columns={columns({
                onEdit: handleEdit,
                onRemove: handleDelete,
                canUpdate,
                canDelete,
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
              loading={listLoading}
              onPageChange={setPage}
              onSortingChange={setSorting}
              onLimitChange={setLimit}
            />
          )}
        </div>
      </div>
      <UserDialog
        open={open}
        onOpenChange={setOpen}
        mode={dialogMode}
        initialUser={selectedUser}
        onSaved={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
