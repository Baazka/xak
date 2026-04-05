"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable";
import { columns, columnsXak } from "./columns";
import { InvoiceList } from "./types";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SortingState, VisibilityState } from "@tanstack/react-table";
import { hasPermission } from "@/lib/permission";
import SkeletonTable from "@/components/tables/SkeletonTable";
import { downloadExcel } from "@/lib/downloadExcel";
import { useToast } from "@/context/ToastContext";
import InvoiceDialog from "./components/insertInvoiceDialog";
import PaymentDialog from "./components/paymentDialog";
import InvoiceCard from "./components/invoiceCard";

export default function XakorgListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // const canCreate = hasPermission(user?.permissions, ["xakorg.create"]);
  // const canUpdate = hasPermission(user?.permissions, ["xakorg.update"]);
  // const canDelete = hasPermission(user?.permissions, ["xakorg.delete"]);

  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;
  const canPayment = true;

  // const [data, setData] = useState<XakOrg[]>([]);
  const [data, setData] = useState<InvoiceList[]>([]);
  const [total, setTotal] = useState(0);
  const [isadmin, setIsadmin] = useState(false);

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

  const sortBy = useMemo(() => sorting[0]?.id ?? "created_date", [sorting]);
  const sortOrder = useMemo(() => (sorting[0]?.desc ? "asc" : "desc"), [sorting]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // default hide
  });

  const [loading, setLoading] = useState(false);

  const [cardBalance, setCardBalance] = useState<number | 0>(0);
  const [cardInvTotal, setCardInvTotal] = useState<number | 0>(0);
  const [cardAud, setCardAud] = useState<number | 0>(0);
  const [cardUnpaid, setCardUnpaid] = useState<number | 0>(0);
  const [cardUnpaidAmt, setCardUnpaidAmt] = useState<number | 0>(0);

  // Debounce search input -> real search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setLoading(true);

        const res = await fetchWithAuth("/api/invoices_new/card", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to load metadata");
        }
        const data = await res.json();
        setCardBalance(data.balance);
        setCardInvTotal(data.invTotal);
        setCardAud(data.audTotal);
        setCardUnpaid(data.unpaidTotal);
        setCardUnpaidAmt(data.unpaidAmount);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadMeta();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setListLoading(true);

      try {
        const res = await fetchWithAuth(
          `/api/invoices_new?page=${page}&limit=${limit}&search=${encodeURIComponent(
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

  const handleEdit = (id: number) => {
    const inv = data.find((x) => x.inv_id === id);
    if (!inv) return;

    setDialogMode("edit");
    setSelectedInvoice({
      inv_id: Number(inv.inv_id),
      inv_no: inv.inv_no,
      inv_date: inv.inv_date,
      inv_type_name: inv.inv_type_name,
      inv_status_name: inv.inv_status_name,
      inv_org_id: Number(inv.inv_org_id),
      inv_type_id: inv.inv_type_id,
      inv_aud_count: inv.inv_aud_count,
      inv_amount: inv.inv_amount,
      org_register_no: inv.org_register_no,
      org_legal_name: inv.org_legal_name,
    });
    setOpen(true);
  };

  const handleRemove = async (id: number) => {
    if (deleteLoadingId !== null) return;

    setDeleteLoadingId(id);

    try {
      const res = await fetchWithAuth(`/api/invoices_new/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Устгах үед алдаа гарлаа");
      }

      toast("success", "Нэхэмжлэх амжилттай устгагдлаа");

      if (data.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setReloadKey((k) => k + 1);
      }
    } catch (err: any) {
      toast("error", err?.message || "Устгах үед алдаа гарлаа");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const [open, setOpen] = useState(false);

  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedInvoice, setSelectedInvoice] = useState<{
    inv_id: number;
    inv_no: string;
    inv_date: string;
    inv_type_name: string;
    inv_status_name: string;
    inv_org_id: number;
    org_register_no: string;
    org_legal_name: string;
    inv_type_id: number;
    inv_aud_count: number;
    inv_amount: number;
  } | null>(null);

  const handleCreate = () => {
    setDialogMode("create");
    setSelectedInvoice(null);
    setOpen(true);
  };

  const [openPayment, setOpenPayment] = useState(false);

  const handlePayment = (id: number) => {
    const inv = data.find((x) => x.inv_id === id);
    if (!inv) return;

    setSelectedInvoice({
      inv_id: Number(inv.inv_id),
      inv_no: inv.inv_no,
      inv_date: inv.inv_date,
      inv_type_name: inv.inv_type_name,
      inv_status_name: inv.inv_status_name,
      inv_org_id: Number(inv.inv_org_id),
      inv_type_id: inv.inv_type_id,
      inv_aud_count: inv.inv_aud_count,
      inv_amount: inv.inv_amount,
      org_register_no: inv.org_register_no,
      org_legal_name: inv.org_legal_name,
    });
    setOpenPayment(true);
  };

  return (
    <>
      <div>
        <PageBreadcrumb pageTitle="Нэхэмжлэх" />
      </div>
      <div className="mb-2">
        <InvoiceCard
          balance={cardBalance}
          invTotal={cardInvTotal}
          audTotal={cardAud}
          unpaidTotal={cardUnpaid}
          unpaidAmount={cardUnpaidAmt}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Нэхэмжлэхийн жагсаалт
            </h3>
          </div>

          <div className="flex gap-3">
            {/* <Button variant="outline" onClick={handleDownload}>
              Татах
            </Button> */}

            {canCreate && isadmin && (
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
          ) : isadmin ? (
            <DataTable
              columns={columns({
                onEdit: handleEdit,
                onRemove: handleRemove,
                onPayment: handleEdit,
                canUpdate,
                canDelete,
                canPayment,
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
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
            />
          ) : (
            <DataTable
              columns={columnsXak({
                onEdit: handleEdit,
                onRemove: handleRemove,
                onPayment: handlePayment,
                canUpdate,
                canDelete,
                canPayment,
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
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
            />
          )}
        </div>
        <InvoiceDialog
          open={open}
          onOpenChange={setOpen}
          mode={dialogMode}
          initialInvoice={selectedInvoice}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
        <PaymentDialog
          open={openPayment}
          onOpenChange={setOpenPayment}
          initialInvoice={selectedInvoice}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
      </div>
    </>
  );
}
