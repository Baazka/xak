//
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

type Item = {
  description: string;
  qty: number;
  unit_price: number;
};

export default function CreateInvoicePage() {
  const router = useRouter();

  const [xakorgId, setXakorgId] = useState<number>(1);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("MNT");

  const [items, setItems] = useState<Item[]>([{ description: "", qty: 1, unit_price: 0 }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => setItems([...items, { description: "", qty: 1, unit_price: 0 }]);

  const updateItem = (idx: number, field: keyof Item, value: any) => {
    const next = [...items];
    next[idx][field] = value;
    setItems(next);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((s, it) => s + it.qty * it.unit_price, 0);

  const submit = async () => {
    setError(null);

    if (!issueDate || !dueDate || items.length === 0) {
      setError("Required fields missing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xakorg_id: xakorgId,
          issue_date: issueDate,
          due_date: dueDate,
          currency,
          items,
        }),
      });

      if (!res.ok) {
        throw new Error("Create invoice failed");
      }

      const json = await res.json();
      router.push(`/invoices/${json.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Create Order (Invoice)</h1>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      {/* Header */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label>Customer ID</label>
          <input
            type="number"
            value={xakorgId}
            onChange={(e) => setXakorgId(Number(e.target.value))}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="MNT">MNT</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label>Issue Date</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <div>
          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
      </div>

      {/* Items */}
      <h2 className="font-medium mb-2">Items</h2>

      {items.map((it, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
          <input
            className="border p-2 col-span-6"
            placeholder="Description"
            value={it.description}
            onChange={(e) => updateItem(idx, "description", e.target.value)}
          />
          <input
            type="number"
            className="border p-2 col-span-2"
            value={it.qty}
            onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
          />
          <input
            type="number"
            className="border p-2 col-span-3"
            value={it.unit_price}
            onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
          />
          <button className="col-span-1 text-red-600" onClick={() => removeItem(idx)}>
            ✕
          </button>
        </div>
      ))}

      <button onClick={addItem} className="text-blue-600 text-sm mb-4">
        + Add item
      </button>

      {/* Summary */}
      <div className="flex justify-between font-medium mb-6">
        <span>Subtotal</span>
        <span>
          {subtotal.toLocaleString()} {currency}
        </span>
      </div>

      {/* Actions */}
      <button
        disabled={loading}
        onClick={submit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Create Order"}
      </button>
    </div>
  );
}
