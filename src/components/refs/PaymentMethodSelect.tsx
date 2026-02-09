"use client";

import { useEffect, useRef, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth"; 

type PaymentMethod = { id: number; name: string };

type Props = {
  value: number | null; // methodId
  onChange: (v: number | null) => void; // setMethodId
  label?: string;
  className?: string;
  disabled?: boolean;
};

export default function PaymentMethodSelect({
  value,
  onChange,
  label = "Payment method",
  className = "mb-3",
  disabled = false,
}: Props) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dev strict mode дээр effect 2 удаа ажиллахаас хамгаална
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetchWithAuth("/api/refs/payment-method", {
          signal: ctrl.signal,
        });

        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.message || `Failed: ${res.status}`);
        }

        const json = await res.json();
        
        setMethods(json?.data ?? []);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError(e?.message || "Failed to load payment methods");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, []);
  return (
    <div className={className}>
      <label className="text-sm">{label}</label>
      <select
        className="border p-2 w-full"
        value={value ?? ""}
        disabled={disabled || loading}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
      >
        <option value="">{loading ? "Loading..." : "-- select --"}</option>
        {methods.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
