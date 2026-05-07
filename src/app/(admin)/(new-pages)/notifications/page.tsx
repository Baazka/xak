"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationItem from "@/components/notification/NotificationItem";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import NotificationSkeleton from "@/components/notification/NotificationSkeleton";

export default function NotificationsPage() {
  const router = useRouter();

  const [page, setPage] = useState(1); // UI-д үлдээнэ
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllRead, loading } = useNotifications();

  // 👉 filter (backend биш frontend түр)
  const filtered = unreadOnly ? notifications.filter((n) => n.is_read === 0) : notifications;

  const handleOpenDetail = async (noti: any) => {
    if (noti.is_read === 0) {
      await markAsRead(noti.id);
    }

    router.push(`/notifications/${noti.id}`);
  };

  const title = useMemo(() => {
    if (unreadOnly) return `Уншаагүй мэдэгдэл (${unreadCount})`;
    return `Бүх мэдэгдэл (${unreadCount} уншаагүй)`;
  }, [unreadOnly, unreadCount]);

  return (
    <>
      <PageBreadcrumb pageTitle="Мэдэгдэл" />

      <div className="rounded-2xl border border-gray-200 bg-white p-0 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* HEADER */}
        <div className="flex flex-col gap-4 border-b p-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Танд ирсэн бүх мэдэгдлийг эндээс харна.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setUnreadOnly((v) => !v)}>
              {unreadOnly ? "Бүх мэдэгдэл" : "Уншаагүй мэдэгдэл"}
            </Button>

            <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
              Бүгдийг уншсан болгох
            </Button>
          </div>
        </div>

        {/* LIST */}
        <>
          {loading ? (
            <NotificationSkeleton />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center text-gray-400 dark:border-gray-800">
              Мэдэгдэл алга.
            </div>
          ) : (
            <div className="">
              {filtered.map((n) => (
                <NotificationItem key={n.id} noti={n} onClick={() => handleOpenDetail(n)} />
              ))}
            </div>
          )}
        </>
      </div>
    </>
  );
}
