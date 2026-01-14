"use client";

import { useRouter } from "next/navigation";
import XakOrgForm from "../components/xakOrgForm";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Button } from "@/components/ui/button";

export default function CreateXakOrgPage() {
  const router = useRouter();

  const handleCreate = async (data: any) => {
    await fetchWithAuth("/api/xakorg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    router.push("/xakorg");
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
          <XakOrgForm onSubmit={handleCreate} />
        </div>
      </div>
    </>
  );
}
