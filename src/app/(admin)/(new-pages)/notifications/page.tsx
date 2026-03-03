"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import NotificationItem from "@/components/notification/NotificationItem";
import NotificationDialog from "./components/NotificationDialog";

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
    if (unreadOnly) return `Unread notifications (${unreadCount})`;
    return `All notifications`;
  }, [unreadOnly, unreadCount]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Inbox style жагсаалт — уншсан/уншаагүй, pagination, mark read.
          </p>
          <NotificationDialog />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUnreadOnly((v) => !v)}
            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
          >
            {unreadOnly ? "Show all" : "Show unread"}
          </button>

          <button
            onClick={onMarkAllRead}
            className="px-3 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page: <span className="font-medium">{page}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
              disabled={page === 1 || loading}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
              disabled={loading || items.length < limit}
            >
              Next
            </button>
          </div>
        </div>

        <div className="p-3">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No notifications</div>
          ) : (
            <div className="space-y-2">
              {items.map((n) => (
                <div key={n.id} onClick={() => onMarkOneRead(n.id)}>
                  {/* NotificationItem чинь date-fns-тай байгаа болохоор шууд ашиглана */}
                  <NotificationItem noti={n} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t text-xs text-gray-500">
          Tip: Next товч идэвхгүй бол {limit}-с бага дата ирсэн гэсэн үг.
        </div>
      </div>
    </div>
  );
}
