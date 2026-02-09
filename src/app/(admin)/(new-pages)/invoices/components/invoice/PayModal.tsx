"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import PaymentMethodSelect from "@/components/refs/PaymentMethodSelect";

type Props = {
  invoiceId: string;
  balance: number;
  currency: string;
  onSuccess: () => void;
  onClose: () => void;
};

export default function PayModal({ invoiceId, balance, currency, onSuccess, onClose }: Props) {
  const [amount, setAmount] = useState(balance);
  const [methodId, setMethodId] = useState<number | null>(null);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);

    if (!methodId) {
      setError("Payment method сонгоно уу");
      return;
    }

    if (amount <= 0 || amount > balance) {
      setError("Payment amount буруу байна");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method_id: methodId,
          payment_ref: reference || null,
        }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Payment failed");
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000">
      <div className="bg-white w-full max-w-md rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Pay Invoice</h2>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        {/* Amount */}
        <div className="mb-3">
          <label className="text-sm">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border p-2 w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            Balance: {balance.toLocaleString()} {currency}
          </div>
        </div>

        {/* Method */}
        <PaymentMethodSelect value={methodId} onChange={setMethodId} />

        {/* Reference */}
        <div className="mb-4">
          <label className="text-sm">Reference</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="INV1024"
            className="border p-2 w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "Paying..." : "Pay"}
          </button>
        </div>
      </div>
    </div>
  );
}
