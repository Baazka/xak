"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SortingState, VisibilityState } from "@tanstack/react-table";
import { hasPermission } from "@/lib/permission";
import SkeletonTable from "@/components/tables/SkeletonTable";
import { downloadExcel } from "@/lib/downloadExcel";
import { useToast } from "@/context/ToastContext";
import InviteOtpModal from "./components/InviteOtpModal";

export default function XakorgListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // const [data, setData] = useState<XakOrg[]>([]);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [reloadKey, setReloadKey] = useState(0);

  const sortBy = useMemo(() => sorting[0]?.id ?? "org_id", [sorting]);
  const sortOrder = useMemo(() => (sorting[0]?.desc ? "desc" : "desc"), [sorting]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // default hide
  });

  // Debounce search input -> real search
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

  const handleDownload = async () => {
    try {
      const sortBy = sorting[0]?.id ?? "org_id";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      await downloadExcel({
        endpoint: "/api/xakorg_contract/export",
        filenamePrefix: "xakorg",
        params: { search, sortBy, sortOrder },
      });

      toast("success", "Excel файл амжилттай татлагдлаа");
    } catch (e: any) {
      toast("error", e?.message || "Excel татах үед алдаа гарлаа");
    }
  };

  return (
    <>
      <div>
        <PageBreadcrumb pageTitle="ХАК гэрээ" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              ХАК гэрээний жагсаалт
            </h3>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDownload}>
              Татах
            </Button>
          </div>
        </div>

        <div className="rounded-b-xl overflow-visible">
          {loading ? <SkeletonTable /> : <>{JSON.stringify(data)}</>}
        </div>
      </div>
    </>
  );
}
