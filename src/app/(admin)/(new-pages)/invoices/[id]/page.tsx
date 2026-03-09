"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import PayModal from "../components/invoice/PayModal";
import InvoiceStatusBadge from "../components/invoice/InvoiceStatusBadge";

type Item = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type Payment = {
  id: string;
  amount: number;
  paid_at: string;
  method: string;
  payment_ref: string | null;
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<{
    paid_amount: number;
    balance: number;
  } | null>(null);
  const [showPay, setShowPay] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetchWithAuth(`/api/invoices/${id}`);
      if (!res.ok) throw new Error("Invoice not found");

      const json = await res.json();
      setInvoice(json.invoice);
      setItems(json.items);
      setPayments(json.payments);
      setSummary(json.summary);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Invoice {invoice.invoice_no}</h1>
          <div className="text-sm text-gray-600">{invoice.customer_name}</div>
        </div>

        <div className="text-right">
          <div>Status: {invoice.status}</div>
          <div>
            Total: {invoice.total_amount.toLocaleString()} {invoice.currency}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceStatusBadge status={invoice.status} dueDate={invoice.due_date} />
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="flex gap-6 mb-6">
          <div>
            <div className="text-sm text-gray-500">Paid</div>
            <div className="font-medium">
              {summary.paid_amount.toLocaleString()} {invoice.currency}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Balance</div>
            <div className="font-medium">
              {summary.balance.toLocaleString()} {invoice.currency}
            </div>
          </div>

          <div className="flex items-end">
            <InvoiceStatusBadge status={invoice.status} dueDate={invoice.due_date} />
          </div>
        </div>
      )}

      {/* Items */}
      <h2 className="font-semibold mb-2">Items</h2>
      <table className="w-full border mb-6">
        <thead>
          <tr>
            <th className="border p-2 text-left">Description</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Unit price</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td className="border p-2">{it.description}</td>
              <td className="border p-2 text-center">{it.quantity}</td>
              <td className="border p-2 text-right">{it.unit_price.toLocaleString()}</td>
              <td className="border p-2 text-right">{it.line_total.toLocaleString()}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="border p-3 text-center text-gray-500">
                No items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Payments */}
      <h2 className="font-semibold mb-2">Payments</h2>
      <table className="w-full border mb-6">
        <thead>
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Method</th>
            <th className="border p-2">Reference</th>
            <th className="border p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{new Date(p.paid_at).toLocaleDateString()}</td>
              <td className="border p-2">{p.method}</td>
              <td className="border p-2">{p.payment_ref ?? "-"}</td>
              <td className="border p-2 text-right">
                {p.amount.toLocaleString()} {invoice.currency}
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={4} className="border p-3 text-center text-gray-500">
                No payments
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="text-blue-600" onClick={() => router.push("/invoices")}>
          ← Back to list
        </button>

        {summary && summary.balance > 0 && invoice.status !== "PAID" && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => setShowPay(true)}
          >
            Pay
          </button>
        )}
      </div>
      {showPay && summary && (
        <PayModal
          invoiceId={id as string}
          balance={summary.balance}
          currency={invoice.currency}
          onClose={() => setShowPay(false)}
          onSuccess={() => {
            setShowPay(false);
            load(); // invoice detail refresh
          }}
        />
      )}
    </div>
  );
}
