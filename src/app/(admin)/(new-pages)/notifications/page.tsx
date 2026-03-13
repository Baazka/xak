"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import NotificationItem from "@/components/notification/NotificationItem";
import NotificationDialog from "./components/NotificationDialog";
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

      <div className="rounded-xl border border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
        <div className="flex items-start justify-between gap-4 p-4">
          {/* LEFT */}
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2">
            <NotificationDialog />

            <Button variant="outline" onClick={() => setUnreadOnly((v) => !v)}>
              {unreadOnly ? "Бүх мэдэгдэл" : "Уншаагүй мэдэгдэл"}
            </Button>

            <Button variant="outline" onClick={onMarkAllRead} disabled={unreadCount === 0}>
              Уншсан болгож тэмдэглэх
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Хуудас: <span className="font-medium">{page}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                disabled={page === 1 || loading}
              >
                {"<<"}
              </button>

              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                disabled={loading || items.length < limit}
              >
                {">>"}
              </button>
            </div>
          </div>

          <div className="p-3">
            {loading ? (
              <div className="p-6 text-center text-gray-400 dark:text-gray-500">Уншиж байна...</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-gray-400 dark:text-gray-500">Хоосон</div>
            ) : (
              <div className="space-y-2">
                {items.map((n) => (
                  <div key={n.id} onClick={() => onMarkOneRead(n.id)}>
                    <NotificationItem noti={n} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
