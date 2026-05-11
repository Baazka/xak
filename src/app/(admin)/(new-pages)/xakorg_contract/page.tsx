"use client";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import type { XakorgContractRow } from "./types";
import { columns } from "./columns";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SortingState, VisibilityState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useToast } from "@/context/ToastContext";
import SkeletonTable from "@/components/tables/SkeletonTable";
import { downloadExcel } from "@/lib/downloadExcel";
import ContractDialog from "./components/contractDialog";
import type { ContractFormValue } from "./components/contractDialog";

export default function XakorgContract() {
  const { toast } = useToast();

  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  // const canCreate = hasPermission(user?.permissions, ["user.create"]);
  // const canUpdate = hasPermission(user?.permissions, ["user.update"]);
  // const canDelete = hasPermission(user?.permissions, ["user.delete"]);

  const [data, setData] = useState<XakorgContractRow[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const sortBy = useMemo(() => sorting[0]?.id ?? "user_id", [sorting]);
  const sortOrder = useMemo(() => (sorting[0]?.desc ? "desc" : "asc"), [sorting]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // default hide
  });

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
      setLoading(true);

      try {
        const res = await fetchWithAuth(
          `/api/xakorg_contract?page=${page}&limit=${limit}&search=${encodeURIComponent(
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

    run();
    return () => controller.abort();
  }, [page, limit, search, sortBy, sortOrder, reloadKey, toast]);

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "confirm">("create");
  const [draftRow, setDraftRow] = useState<ContractFormValue | null>(null);

  //  New create
  const handleCreate = () => {
    setDialogMode("create");
    setDraftRow(null);
    setOpen(true);
  };

  //  Edit
  const handleEdit = (id: number) => {
    const row = data.find((x) => x.contract_id === id);
    if (!row) return;

    setDialogMode("edit");
    setDraftRow({
      contract_id: row.contract_id,
      contract_name: row.contract_name,
      contract_begin_date: row.contract_begin_date,
      contract_end_date: row.contract_end_date,
      contract_file_id: row.contract_file_id,
    });
    setOpen(true);
  };
  //  Confirm
  const handleConfirm = (id: number) => {
    const row = data.find((x) => x.contract_id === id);
    if (!row) return;

    setDialogMode("confirm");
    setDraftRow({
      contract_id: row.contract_id,
      contract_name: row.contract_name,
      contract_begin_date: row.contract_begin_date,
      contract_end_date: row.contract_end_date,
      contract_file_id: row.contract_file_id,
    });
    setOpen(true);
  };
  const handleDownload = async () => {
    try {
      const sortBy = sorting[0]?.id ?? "contract_id";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      await downloadExcel({
        endpoint: "/api/xakorg_contract/export",
        filenamePrefix: "xakorg_contract",
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
        <PageBreadcrumb pageTitle="Байгууллагын гэрээ" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Байгууллагын гэрээ жагсаалт
            </h3>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownload}>
              Татах
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
          ) : (
            <DataTable
              columns={columns({
                onEdit: handleEdit,
                onConfirm: handleConfirm,
                canUpdate,
                page,
                limit,
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
      <ContractDialog
        open={open}
        onOpenChange={setOpen}
        mode={dialogMode}
        initialData={draftRow}
        onSaved={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}
