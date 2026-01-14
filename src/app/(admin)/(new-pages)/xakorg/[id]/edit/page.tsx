
import { cookies } from "next/headers";
import XakOrgForm from "../../components/xakOrgForm";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditXakOrgPage({ params }: Props) {
  const { id } = await params;

  const cookieStore = cookies();
  const cookieHeader = (await cookieStore)
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${process.env.APP_URL}/api/xakorg/${id}`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    // 404 эсвэл permission алдаа
    throw new Error("Xakorg not found");
  }

  const data = await res.json();

  return (
    <>
      <div>
        <PageBreadcrumb pageTitle="Байгууллага / Засах" />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Харьяа байгууллага засах
          </h3>
          <Link href="/xakorg">
            <Button variant="outline">Буцах</Button>
          </Link>
        </div>

        <div className="p-5">
          <XakOrgForm id={id} initialData={data} />
        </div>
      </div>
    </>
  );
}
