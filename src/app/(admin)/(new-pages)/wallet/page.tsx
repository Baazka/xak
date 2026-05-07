"use client";

import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { hasPermission } from "@/lib/permission";
import { SortingState, VisibilityState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QWalletCards from "./components/WalletCards";
// import InvoiceStatusBadge from "./components/invoice/InvoiceStatusBadge";
import SkeletonTable from "@/components/tables/SkeletonTable";
import { DataTable } from "@/components/tables/DataTable";
import { columns } from "./columns";
import type { Wallet } from "./types";
import { useToast } from "@/context/ToastContext";
import DepositDialog from "./components/depositDialog";

export default function WalletPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const canCreate = hasPermission(user?.permissions, ["invoice.create"]);
  const canUpdate = hasPermission(user?.permissions, ["invoice.update"]);
  const canDelete = hasPermission(user?.permissions, ["invoice.delete"]);

  const [data, setData] = useState<Wallet[]>([]);
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(Number || 0.0);

  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL"); // ✅ MISSING байсан
  const [sorting, setSorting] = useState<SortingState>([]);
  const [open, setOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // default hide
  });

  const fetchData = async () => {
    if (loading) return;

    setLoading(true);

    const sortBy = sorting[0]?.id ?? "tran_id";
    const sortOrder = sorting[0]?.desc ? "asc" : "desc";

    try {
      const res = await fetchWithAuth(
        `/api/wallet` +
          `?page=${page}` +
          `&limit=${limit}` +
          `&search=${search}` +
          `&status=${status}` +
          `&sortBy=${sortBy}` +
          `&sortOrder=${sortOrder}`
      );

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const json = await res.json();

      setData(json.data);
      setTotal(json.total);
      if (json.balance) setBalance(json.balance.toLocaleString("en-US"));
    } catch (err: any) {
      toast("error", err?.message || "Мэдээлэл ачааллах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchData();
  }, [page, limit, search, status, sorting, reloadKey]);

  return (
    <>
      {/* Header + Create */}
      <div className="mb-4">
        <QWalletCards balance={balance} handledepo={() => setOpen(true)} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Гүйлгээний түүх
          </h3>
        </div>

        <div className="rounded-b-xl overflow-visible">
          {loading ? (
            <SkeletonTable />
          ) : (
            <DataTable
              columns={columns({
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
        <DepositDialog
          open={open}
          onOpenChange={setOpen}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
      </div>
    </>
  );
}
