"use client";

import { useRouter } from "next/navigation";
import XakOrgForm from "../components/xakOrgForm";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

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

  return <XakOrgForm onSubmit={handleCreate} />;
}
