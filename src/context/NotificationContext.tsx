"use client";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Notification = {
  id: number;
  title?: string;
  content?: string;
  date?: string;
  is_read: number; // 0 | 1
};

type NotificationCtx = {
  notifications: Notification[];
  unreadCount: number;
  open: boolean;
  toggleOpen: () => void;
  close: () => void;
  markAsRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
};

const NotificationContext = createContext<NotificationCtx | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(() => {
    return notifications.reduce((acc, n) => acc + (n.is_read === 0 ? 1 : 0), 0);
  }, [notifications]);

  const refresh = async () => {
    try {
      const res = await fetchWithAuth("/api/notifications", { method: "GET" });
      if (!res.ok) return;

      const json = await res.json();
      setNotifications(Array.isArray(json?.data) ? json.data : []);
    } catch (error) {
      console.error("notifications refresh error", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const target = notifications.find((n) => n.id === id);
      if (!target || target.is_read === 1) return;

      const res = await fetchWithAuth(`/api/notifications/${id}/read`, {
        method: "POST",
      });

      if (!res.ok) return;

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    } catch (error) {
      console.error("markAsRead error", error);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetchWithAuth("/api/notifications/read-all", {
        method: "POST",
      });

      if (!res.ok) return;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error("markAllRead error", error);
    }
  };

  const toggleOpen = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        open,
        toggleOpen,
        close,
        markAsRead,
        markAllRead,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
};
