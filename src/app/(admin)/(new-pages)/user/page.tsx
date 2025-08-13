"use client";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import type { User } from "./userColumn";
import { columns } from "./userColumn";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function User() {
  const [data, setData] = useState<User[]>([]);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 5;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/users?page=${page}&size=${pageSize}`);
        const json = await res.json();
        setData(json.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

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
                  <button className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 sm:w-auto">
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.2502 4.99951C9.2502 4.5853 9.58599 4.24951 10.0002 4.24951C10.4144 4.24951 10.7502 4.5853 10.7502 4.99951V9.24971H15.0006C15.4148 9.24971 15.7506 9.5855 15.7506 9.99971C15.7506 10.4139 15.4148 10.7497 15.0006 10.7497H10.7502V15.0001C10.7502 15.4143 10.4144 15.7501 10.0002 15.7501C9.58599 15.7501 9.2502 15.4143 9.2502 15.0001V10.7497H5C4.58579 10.7497 4.25 10.4139 4.25 9.99971C4.25 9.5855 4.58579 9.24971 5 9.24971H9.2502V4.99951Z"
                        fill=""
                      />
                    </svg>
                    Нэмэх
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
              <DataTable columns={columns} data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
