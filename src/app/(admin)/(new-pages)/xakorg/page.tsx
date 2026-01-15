"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable";
import { columns } from "./columns";
import { XakOrg } from "./types";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React from "react";
import { SortingState } from "@tanstack/react-table";
import { hasPermission } from "@/lib/permission";
import Alert from "@/components/ui/alert/Alert";
import SkeletonTable from "@/components/tables/SkeletonTable";

export default function XakorgListPage() {
  const router = useRouter();
  const { user } = useAuth();

  const canCreate = hasPermission(user?.permissions, ["xakorg.create"]);
  const canUpdate = hasPermission(user?.permissions, ["xakorg.update"]);
  const canDelete = hasPermission(user?.permissions, ["xakorg.delete"]);

  const [data, setData] = useState<XakOrg[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchData = async () => {
    if (loading) return;

    setAlert(null);
    setLoading(true);

    const sortBy = sorting[0]?.id ?? "id";
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";

    try {
      const res = await fetchWithAuth(
        `/api/xakorg?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setData(data.data);
      setTotal(data.total);
    } catch (err: any) {
      setAlert(err.message || "Мэдээлэл ачааллах үед алдаа гарлаа");
    } finally {
      setLoading(false);
      if (initialLoading) {
        setInitialLoading(false);
      }
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/xakorg/${id}/edit`);
  };

  const handleRemove = async (id: number) => {
    if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;

    if (loading) return;

    setLoading(true);
    setAlert(null);

    try {
      const res = await fetchWithAuth(`/api/xakorg/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Устгах үед алдаа гарлаа");
      }

      if (data.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchData();
      }
    } catch (err: any) {
      setAlert(err.message || "Устгах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, sorting]);

  return (
    <>
      <div>
        <PageBreadcrumb pageTitle="Байгууллага" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Байгууллагын жагсаалт
            </h3>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your store&apos;s progress to boost your sales.
            </p> */}
          </div>

          <div className="flex gap-3">
            <Button variant="outline">
              Татах
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M16.667 13.3333V15.4166C16.667 16.1069 16.1074 16.6666 15.417 16.6666H4.58295C3.89259 16.6666 3.33295 16.1069 3.33295 15.4166V13.3333M10.0013 13.3333L10.0013 3.33325M6.14547 9.47942L9.99951 13.331L13.8538 9.47942"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            {canCreate && (
              <Button
                onClick={() => router.push("/xakorg/create")}
                className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 10.0002H15.0006M10.0002 5V15.0006"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Шинэ бүртгэл
              </Button>
            )}
          </div>
        </div>
        {alert && <Alert variant="error" title="Алдаа" message={alert} showLink={false} />}
        {initialLoading ? (
          <SkeletonTable />
        ) : (
          <DataTable
            columns={columns({
              onEdit: handleEdit,
              onRemove: handleRemove,
              canUpdate,
              canDelete,
              page,
              limit,
            })}
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
        )}
      </div>
    </>
  );
}
