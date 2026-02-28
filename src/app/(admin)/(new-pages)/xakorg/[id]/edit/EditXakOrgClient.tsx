"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import XakOrgForm from "../../components/xakOrgForm";
import { Button } from "@/components/ui/button";
import Alert from "@/components/ui/alert/Alert";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function EditXakOrgClient({ id, initialData }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpdate = async (data: any) => {
    if (loading) return;

    setLoading(true);
    setAlert(null);

    try {
      const res = await fetchWithAuth(`/api/xakorgnew/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Засах үед алдаа гарлаа");
      }

      toast("success", "Амжилттай засагдлаа");
      router.push("/xakorg");
    } catch (err: any) {
      setAlert(err?.message || "Засах үед алдаа гарлаа");
      toast("error", err?.message || "Алдаа гарлаа"); // optional
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex justify-between border-b px-5 py-4">
        <h3 className="text-lg font-semibold">ХАК бүртгэл засах</h3>
        <Link href="/xakorg">
          <Button variant="outline" disabled={loading}>
            Буцах
          </Button>
        </Link>
      </div>

      <div className="p-5 space-y-4">
        {alert && <Alert variant="error" title="Алдаа" message={alert} showLink={false} />}

        <XakOrgForm initialData={initialData} onSubmit={handleUpdate} loading={loading} />
      </div>
    </div>
  );
}
