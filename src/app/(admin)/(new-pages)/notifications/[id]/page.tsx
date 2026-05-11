import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { formatDate } from "@/lib/formatDate";

type Props = {
  params: Promise<{ id: string }>;
};

type NotificationDetail = {
  id: number;
  noti_title?: string;
  noti_content?: string;
  noti_date?: string;
};

async function getNotification(id: string): Promise<NotificationDetail | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const host = headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const protocol = forwardedProto || (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) return null;

  const res = await fetch(`${protocol}://${host}/api/notifications/${id}`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  return (await res.json()) as NotificationDetail;
}

export default async function NotificationDetailPage({ params }: Props) {
  const { id } = await params;
  const noti = await getNotification(id);

  return (
    <>
      <PageBreadcrumb pageTitle="Мэдэгдлийн дэлгэрэнгүй" />

      <div className="mt-4 mb-4">
        <Link href="/notifications">
          <Button variant="outline">Буцах</Button>
        </Link>
      </div>

      {!noti ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-sm text-red-500">Мэдэгдэл олдсонгүй.</div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {noti.noti_title || "Мэдэгдэл"}
            </h1>

            {noti.noti_date && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {formatDate(noti.noti_date, "datetime")}
              </p>
            )}
          </div>

          <div
            className="prose prose-sm mt-6 max-w-none text-gray-700 dark:prose-invert dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: noti.noti_content ?? "" }}
          />
        </div>
      )}
    </>
  );
}
