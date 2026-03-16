"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import NotificationItem from "@/components/notification/NotificationItem";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { Button } from "@/components/ui/button";

type Notification = {
  id: number;
  title?: string;
  content?: string;
  date?: string;
  is_read: number; // 0/1
};

type ApiResponse = {
  data: Notification[];
  page: number;
  limit: number;
  unreadCount: number;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const fetchList = async (nextPage = page, nextUnreadOnly = unreadOnly) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(nextPage));
      qs.set("limit", String(limit));
      if (nextUnreadOnly) qs.set("unreadOnly", "1");

      const res = await fetchWithAuth(`/api/notifications?${qs.toString()}`);
      if (!res.ok) return;

      const json = (await res.json()) as ApiResponse;
      setItems(Array.isArray(json.data) ? json.data : []);
      setUnreadCount(Number(json.unreadCount ?? 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(1, unreadOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  useEffect(() => {
    fetchList(page, unreadOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onMarkAllRead = async () => {
    const res = await fetchWithAuth("/api/notifications/read-all", { method: "POST" });
    if (!res.ok) return;

    // UI update
    setItems((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
  };

  const onMarkOneRead = async (notiId: number) => {
    const res = await fetchWithAuth(`/api/notifications/${notiId}/read`, { method: "POST" });
    if (!res.ok) return;

    setItems((prev) => prev.map((n) => (n.id === notiId ? { ...n, is_read: 1 } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const title = useMemo(() => {
    if (unreadOnly) return `Уншаагүй мэдэгдэл (${unreadCount})`;
    return `Бүх мэдэгдэл (${unreadCount} уншаагүй)`;
  }, [unreadOnly, unreadCount]);

  return (
    <>
      <div>
        <PageBreadcrumb pageTitle="Мэдэгдэл" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Танд ирсэн бүх мэдэгдлийг эндээс харж, уншсан төлөвт оруулна.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setUnreadOnly((v) => !v)}>
              {unreadOnly ? "Бүх мэдэгдэл" : "Уншаагүй мэдэгдэл"}
            </Button>

            <Button variant="outline" onClick={onMarkAllRead} disabled={unreadCount === 0}>
              Бүгдийг уншсан болгох
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Хуудас <span className="font-medium text-gray-900 dark:text-gray-100">{page}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Өмнөх
            </button>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || items.length < limit}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Дараах
            </button>
          </div>
        </div>

        <div className="px-3 pb-3">
          {loading ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-400 dark:border-gray-800 dark:text-gray-500">
              Уншиж байна...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-gray-400 dark:border-gray-800 dark:text-gray-500">
              Уншаагүй мэдэгдэл алга.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onMarkOneRead(n.id)}
                  className="block w-full text-left"
                >
                  <NotificationItem noti={n} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
