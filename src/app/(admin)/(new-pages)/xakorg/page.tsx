"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable";
import { columns } from "./columns";
import { XakOrg } from "./types";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useAuth } from "@/context/AuthContext";

export default function XakorgListPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [data, setData] = useState<XakOrg[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/xakorg?page=${page}&limit=${limit}`);

      if (!res.ok) {
        throw new Error("Fetch failed");
      }

      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Мэдээлэл татах үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/xakorg/${id}/edit`);
  };

  const handleRemove = async (id: number) => {
    if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;

    const res = await fetchWithAuth(`/api/xakorg/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Устгах үед алдаа гарлаа");
      return;
    }

    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => router.push("/xakorg/create")}>Шинээр бүртгэх</Button>
      </div>

      <DataTable
        data={data}
        loading={loading}
        columns={columns({
          onEdit: handleEdit,
          onRemove: handleRemove,
        })}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </>
  );
}
