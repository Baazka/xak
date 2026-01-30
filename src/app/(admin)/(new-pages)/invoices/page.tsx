"use client";

import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { hasPermission } from "@/lib/permission";
import { SortingState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InvoiceStatusBadge from "./components/invoice/InvoiceStatusBadge";

type Invoice = {
  id: string;
  invoice_no: string;
  customer_name: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  currency: string;
  status: string;
};

export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const canCreate = hasPermission(user?.permissions, ["invoice.create"]);
  const canUpdate = hasPermission(user?.permissions, ["invoice.update"]);
  const canDelete = hasPermission(user?.permissions, ["invoice.delete"]);

  const [data, setData] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState<{
    total_count: number;
    overdue_amount: number;
    due_30_days: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL"); // ✅ MISSING байсан
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchData = async () => {
    if (loading) return;

    setAlert(null);
    setLoading(true);

    const sortBy = sorting[0]?.id ?? "created_at";
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";

    try {
      const res = await fetchWithAuth(
        `/api/invoices` +
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
      setTotal(json.metrics?.total_count ?? 0);
      setMetrics(json.metrics);
    } catch (err: any) {
      setAlert(err.message || "Мэдээлэл ачааллах үед алдаа гарлаа");
    } finally {
      setLoading(false);
      if (initialLoading) setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, status, sorting]);

  return (
    <>
      {/* Header + Create */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Invoices</h1>

        {
          // canCreate &&
          <button
            onClick={() => router.push("/invoices/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Create Order
          </button>
        }
      </div>

      {alert && <div className="text-red-600 mb-2">{alert}</div>}

      {metrics && (
        <div className="flex gap-6 mb-4">
          <div>Нийт: {metrics.total_count}</div>
          <div>Overdue: {metrics.overdue_amount.toLocaleString()} ₮</div>
          <div>30 хоногт төлөх: {metrics.due_30_days.toLocaleString()} ₮</div>
        </div>
      )}

      <table border={1} cellPadding={8} className="table w-full border border-collapse">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Customer</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((inv) => (
            <tr
              key={inv.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => router.push(`/invoices/${inv.id}`)}
            >
              <td>{inv.invoice_no}</td>
              <td>{inv.customer_name}</td>
              <td>{inv.issue_date}</td>
              <td>{inv.due_date}</td>
              <td>
                {inv.total_amount.toLocaleString()} {inv.currency}
              </td>
              <td>
                <InvoiceStatusBadge status={inv.status} dueDate={inv.due_date} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
