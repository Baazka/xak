"use client";

import { useRouter } from "next/navigation";
import XakOrgForm from "../components/xakOrgForm";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Alert from "@/components/ui/alert/Alert";
import { useToast } from "@/context/ToastContext";

export default function CreateXakOrgPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const handleCreate = async (data: any) => {
    if (loading) return;

    setAlert(null);
    setLoading(true);

    try {
      const res = await fetchWithAuth("/api/xakorg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Бүртгэх үед алдаа гарлаа");
      }

      toast("success", "Байгууллага амжилттай бүртгэгдлээ");
      router.push("/xakorg");
    } catch (err: any) {
      const msg = err?.message || "Бүртгэх үед алдаа гарлаа";
      setAlert(msg);
      toast("error", msg); // хүсвэл зөвхөн Alert үлдээгээд энэ мөрийг авч болно
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <PageBreadcrumb pageTitle="Байгууллага / Шинэ бүртгэл" />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Шинэ байгууллага бүртгэх
          </h3>

          <Button variant="outline" onClick={() => router.push("/xakorg")}>
            Буцах
          </Button>
        </div>

        <div className="p-5">
          {alert && <Alert variant="error" title="Алдаа" message={alert} showLink={false} />}

          <XakOrgForm onSubmit={handleCreate} />
        </div>
      </div>
    </>
  );
}
