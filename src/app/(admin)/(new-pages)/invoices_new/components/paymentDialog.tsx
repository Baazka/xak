"use client";

import * as React from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import type { InvoiceList } from "../types";
import Label from "@/components/form/Label";
import Radio from "@/components/form/input/Radio";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialInvoice?: Pick<
    InvoiceList,
    | "inv_id"
    | "inv_no"
    | "inv_date"
    | "inv_type_name"
    | "inv_status_name"
    | "inv_org_id"
    | "inv_type_id"
    | "inv_aud_count"
    | "inv_amount"
    | "org_register_no"
    | "org_legal_name"
  > | null;

  onSaved?: () => void;
};

type orgListType = {
  org_id: number;
  org_register_no: string;
  org_legal_name: string;
};

type orgList = {
  value: number;
  label: string;
};

export default function paymentDialog({ open, onOpenChange, initialInvoice, onSaved }: Props) {
  const [orgId, setOrgId] = React.useState<number | "">("");
  const [realorg, setRealorg] = React.useState<orgList[]>([]);

  const [balance, setBalance] = React.useState<number | "">("");
  const [inv_no, setInv_no] = React.useState<string | "">("");
  const [inv_amount, setInv_amount] = React.useState<number | "">("");
  const [inv_date, setInv_date] = React.useState<string | "">("");
  const [inv_aud_count, setInv_aud_count] = React.useState<number | "">("");
  const [inv_type_name, setInv_type_name] = React.useState<string | "">("");
  const [inv_status_name, setInv_status_name] = React.useState<string | "">("");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [metaLoading, setMetaLoading] = React.useState(false);

  React.useEffect(() => {
    const loadMeta = async () => {
      try {
        setMetaLoading(true);

        const res = await fetchWithAuth("/api/invoices_new/meta", {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to load metadata");
        }
        const data = await res.json();

        setBalance(data.balance);
      } catch (error) {
        console.error(error);
      } finally {
        setMetaLoading(false);
      }
    };

    loadMeta();
  }, []);

  React.useEffect(() => {
    if (!open) return;

    if (initialInvoice) {
      setInv_no(initialInvoice.inv_no ?? "");
      setInv_date(initialInvoice.inv_date ?? "");
      setInv_type_name(initialInvoice.inv_type_name ?? "");
      setInv_status_name(initialInvoice.inv_status_name ?? "");
      setInv_aud_count(initialInvoice.inv_aud_count ?? "");
      setInv_amount(initialInvoice.inv_amount ?? "");
    } else {
      setInv_no("");
      setInv_date("");
      setInv_type_name("");
      setInv_status_name("");
      setInv_aud_count("");
      setInv_amount("");
    }
    setError(null);
    setLoading(false);
  }, [open, initialInvoice]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);
    try {
      let res: Response;
      // ✅ CREATE → POST /api/users
      res = await fetchWithAuth("/api/invoices_new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || "Хадгалахад алдаа гарлаа");
        return;
      }

      onOpenChange(false);
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || "Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-gray-200 px-3 py-2 text-sm " +
    "focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 " +
    "dark:border-gray-700 dark:bg-gray-900 dark:text-white";

  const [selectedOption, setSelectedOption] = React.useState<string>("Wallet");
  const isWallet = selectedOption === "Wallet";
  const handleRadioChange = (value: string) => {
    setSelectedOption(value);
    console.log("Selected:", value);
  };

  const isWalletGood = balance >= inv_amount;

  const handleWallet = async (e: any) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);
    try {
      let res: Response;

      res = await fetchWithAuth("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          inv_id: initialInvoice?.inv_id,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || "Хадгалахад алдаа гарлаа");
        return;
      }

      onOpenChange(false);
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || "Сүлжээний алдаа");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Нэхэмжлэх төлөлт</h2>

          <button
            className="rounded px-2 py-1 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-1 block text-sm">Нэхэмжлэхийн дугаар:</label>
              <input
                className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                value={inv_no}
                readOnly
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Огноо:</label>
              <input
                className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                value={inv_date}
                readOnly
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Төрөл:</label>
              <input
                className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                value={inv_type_name}
                readOnly
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Төлөв:</label>
              <input
                className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                value={inv_status_name}
                readOnly
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Аудитын эрх:</label>
              <input
                className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                value={inv_aud_count}
                readOnly
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Нийт дүн:</label>
              <input
                className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                value={`${inv_amount.toLocaleString("en-US")}₮`}
                readOnly
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 col-span-full">
              <Label className="m-0">Төлбөр хийх:</Label>
              <div className="flex flex-wrap items-center gap-4">
                <Radio
                  id="Wallet"
                  name="methodSelect"
                  value="Wallet"
                  label="Данснаас төлөх"
                  checked={selectedOption === "Wallet"}
                  onChange={handleRadioChange}
                />
                <Radio
                  id="Qpay"
                  name="methodSelect"
                  value="QPay"
                  label="QPay төлөх"
                  checked={selectedOption === "QPay"}
                  onChange={handleRadioChange}
                />
              </div>
            </div>
          </div>
          <div>
            {isWallet ? (
              <div className="grid grid-cols-1">
                <label className="mb-1 block text-sm mb-2">Дансны үлдэгдэл:</label>
                <div className="flex items-center gap-6">
                  <input
                    className={inputClass + "text-sm font-medium text-gray-800 dark:text-white/90"}
                    value={`${balance.toLocaleString("en-US")}₮`}
                    readOnly
                  />
                  {isWalletGood ? (
                    <Button
                      onClick={handleWallet}
                      className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
                    >
                      Төлбор хийх
                    </Button>
                  ) : (
                    <Button
                      onClick={handleWallet}
                      className="bg-brand-500 shadow-sm hover inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
                    >
                      Данс цэнэглэх
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p> QPay</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
