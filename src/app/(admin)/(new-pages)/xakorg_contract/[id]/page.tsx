import { cookies, headers } from "next/headers";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EditXakOrgClient from "./EditXakOrgClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditXakOrgPage({ params }: Props) {
  const { id } = await params;

  if (!id) {
    throw new Error("Invalid xakorg id");
  }

  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const headerStore = await headers();
  const host = headerStore.get("host");

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/xakorgnew/${id}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (res.status === 404) {
    throw new Error("Xakorg not found");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch xakorg");
  }

  const data = await res.json();

  return (
    <>
      <PageBreadcrumb pageTitle="ХАК бүртгэл засах" />
      <EditXakOrgClient id={id} initialData={data} />
    </>
  );
}
